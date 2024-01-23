#include <App.h>

#include <mc_rtc/Configuration.h>

#include <fstream>
#include <variant>

#include "Base64.h"
#include "TestServer.h"

/* Note that uWS::SSLApp({options}) is the same as uWS::App() when compiled without SSL support */

using PerSocketData = std::monostate;
static constexpr bool use_ssl = false;
static constexpr bool is_server = true;
using WebSocket = uWS::WebSocket<use_ssl, is_server, PerSocketData>;

int main()
{
  std::mutex server_mutex;
  uWS::App::WebSocketBehavior<PerSocketData> behavior;
  TestServer server;
  double t_ = 0.0;
  server.builder.addElement({}, mc_rtc::gui::Label("Time", t_));
  server.builder.addElement({"Buttons"},
                            mc_rtc::gui::Button("Hello world", []() { mc_rtc::log::critical("HELLO WORLD!"); }));
  server.builder.addElement({"Buttons", "Horizontal"}, mc_rtc::gui::ElementsStacking::Horizontal,
                            mc_rtc::gui::Button("1", []() { mc_rtc::log::info("1"); }),
                            mc_rtc::gui::Button("2", []() { mc_rtc::log::info("2"); }),
                            mc_rtc::gui::Button("3", []() { mc_rtc::log::info("3"); }));
  server.builder.addElement({"Labels"}, mc_rtc::gui::Label("Hello", "world"),
                            mc_rtc::gui::ArrayLabel("Time", {"Minutes", "Seconds"},
                                                    [&]() -> std::array<double, 2>
                                                    {
                                                      size_t seconds = std::floor(t_);
                                                      return {seconds / 60, seconds % 60};
                                                    }));
  std::thread th(
      [&]()
      {
        while(true)
        {
          {
            std::unique_lock<std::mutex> lck(server_mutex);
            server.publish();
            t_ += 0.005;
          }
          std::this_thread::sleep_for(std::chrono::milliseconds(5));
        }
      });

  // Set maxBackpressure = 0 so that uWS does *not* drop any messages due to
  // back pressure.
  behavior.maxBackpressure = 0;
  behavior.open = [](WebSocket * ws) { ws->subscribe("all"); };
  behavior.message = [&](WebSocket * ws, std::string_view message, uWS::OpCode opCode)
  {
    // FIXME Need a string_view constructor
    auto cfg = mc_rtc::Configuration::fromData(std::string(message));
    std::string request = cfg("request", std::string(""));
    if(request == "getMesh")
    {
      std::ifstream ifs("/home/gergondet/devel/sandbox/mc_rtc-webui/build/models/head.gltf");
      std::string msg = {std::istreambuf_iterator<char>(ifs), std::istreambuf_iterator<char>()};
      mc_rtc::Configuration out;
      out.add("response", "getMesh");
      out.add("data", macaron::Base64::Encode(msg));
      ws->send(out.dump(), uWS::OpCode::TEXT);
    }
    else if(request == "getGUI")
    {
      mc_rtc::Configuration out;
      out.add("response", "getGUI");
      {
        std::unique_lock<std::mutex> lck(server_mutex);
        const auto & [data, size] = server.server.data();
        out.add("data", macaron::Base64::Encode(data, size));
      }
      ws->send(out.dump(), uWS::OpCode::TEXT);
    }
    else if(request == "requestGUI")
    {
      auto data = cfg("data");
      std::vector<std::string> category = data("category");
      std::string name = data("name");
      auto payload = data("payload", mc_rtc::Configuration{});
      server.builder.handleRequest(category, name, payload);
    }
    else { mc_rtc::log::critical("Unknown request: {}", request); }
  };

  std::string content_;
  /* Overly simple hello world app */
  uWS::App({.key_file_name = "misc/key.pem", .cert_file_name = "misc/cert.pem", .passphrase = "1234"})
      .get("/",
           [&content_](uWS::HttpResponse<false> * res, uWS::HttpRequest * req)
           {
             std::cout << "Requested: " << req->getUrl() << "\n";
             std::ifstream ifs("/home/gergondet/devel/sandbox/mc_rtc-webui/data/index.html");
             content_ = {std::istreambuf_iterator<char>(ifs), std::istreambuf_iterator<char>()};
             res->end(content_);
           })
      .get("/main.js",
           [&content_](uWS::HttpResponse<false> * res, auto * /*req*/)
           {
             std::ifstream ifs("/home/gergondet/devel/sandbox/mc_rtc-webui/data/main.js");
             content_ = {std::istreambuf_iterator<char>(ifs), std::istreambuf_iterator<char>()};
             res->writeHeader("Content-Type", "text/javascript; charset=utf-8");
             res->end(content_);
           })
      .get("/models/*",
           [&content_](uWS::HttpResponse<false> * res, uWS::HttpRequest * req)
           {
             std::cout << "Requested: " << req->getUrl() << "\n";
             std::ifstream ifs("/home/gergondet/devel/sandbox/mc_rtc-webui/build/" + std::string(req->getUrl()));
             content_ = {std::istreambuf_iterator<char>(ifs), std::istreambuf_iterator<char>()};
             res->end(content_);
           })
      .ws<PerSocketData>("/*", std::move(behavior))
      .listen(8080,
              [](auto * listen_socket)
              {
                if(listen_socket) { std::cout << "Listening on port " << 8080 << std::endl; }
              })
      .run();

  std::cout << "Failed to listen on port 8080" << std::endl;
}

#include "TestServer.h"

static bool checked_ = false;
static std::string str_input = "Hello world";

void TestServer::setup()
{
  builder.addElement({}, mc_rtc::gui::Label("Time", t_));
  builder.addElement({"Buttons"},
                            mc_rtc::gui::Button("Hello world", []() { mc_rtc::log::critical("HELLO WORLD!"); }));
  builder.addElement({"Buttons", "Horizontal"}, mc_rtc::gui::ElementsStacking::Horizontal,
      mc_rtc::gui::Button("1", []() { mc_rtc::log::info("1"); }),
      mc_rtc::gui::Button("2", []() { mc_rtc::log::info("2"); }),
      mc_rtc::gui::Button("3", []() { mc_rtc::log::info("3"); }));
  builder.addElement({"Inputs"}, mc_rtc::gui::StringInput("String", str_input));
  builder.addElement({"Checkbox"},
                            mc_rtc::gui::Checkbox("Hello world", checked_));
  builder.addElement({"Labels"}, mc_rtc::gui::Label("Hello", "world"),
                            mc_rtc::gui::ArrayLabel("Time", {"Minutes", "Seconds"},
                                                    [this]() -> std::array<double, 2>
                                                    {
                                                      return {std::floor(t_ / 60), std::remainder(t_, 60)};
                                                    }));
}

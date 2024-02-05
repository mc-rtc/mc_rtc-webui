/*
 * Copyright 2015-2023 CNRS-UM LIRMM, CNRS-AIST JRL
 */

#pragma once

#include <mc_control/ControllerServer.h>

#include <mc_rtc/gui.h>

#include <chrono>
#include <thread>

#ifndef M_PI
#  include <boost/math/constants/constants.hpp>
#  define M_PI boost::math::constants::pi<double>()
#endif

struct TestServer
{
  virtual void publish()
  {
    server.handle_requests(builder);
    server.publish(builder);
    t_ += 0.005;
  }

  mc_control::ControllerServerConfiguration cfg = []() {
    mc_control::ControllerServerConfiguration cfg;
    cfg.websocket_config = mc_control::ControllerServerConfiguration::WebSocketConfiguration{"*", 8181, 8182};
    return cfg;
  }();
  mc_control::ControllerServer server{0.005, cfg};
  mc_rtc::gui::StateBuilder builder;
  double t_ = 0.0;

  void setup();

  void loop()
  {
    while(1)
    {
      auto now = std::chrono::high_resolution_clock::now();
      publish();
      std::this_thread::sleep_until(now + std::chrono::milliseconds(5));
    }
  }
};

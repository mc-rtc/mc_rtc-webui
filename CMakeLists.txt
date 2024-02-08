cmake_minimum_required(VERSION 3.20)

set(CMAKE_C_EXTENSIONS OFF)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CMAKE_CXX_STANDARD 20)

project(mc_rtc-webui LANGUAGES C CXX VERSION 1.0.0)

find_package(Threads REQUIRED)
find_package(ZLIB REQUIRED)

include(cmake/FetchuWebSockets.cmake)

find_package(mc_rtc REQUIRED)

set(main_SRC
  src/main.cpp
  src/ModelStore.h
  src/ModelStore.cpp
  src/TestServer.h
  src/TestServer.cpp
)

add_executable(main src/main.cpp src/TestServer.cpp src/ModelStore.cpp)
target_link_libraries(main PUBLIC uWebSockets::uWebSockets uSockets::uSockets mc_rtc::mc_control_client)
if(TARGET mc_rtc::mc_rtc_ros)
  target_link_libraries(main PUBLIC mc_rtc::mc_rtc_ros)
  target_compile_definitions(main PUBLIC MC_RTC_HAS_ROS)
endif()

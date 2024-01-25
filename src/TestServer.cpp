#include "TestServer.h"

namespace
{

bool checked_ = false;
std::string str_input = "Hello world";
int int_input_ = 0;
double dbl_input = 0.0;
double dbl_slide = 50.0;
Eigen::Vector3d v3d_input = Eigen::Vector3d::Zero();
std::string combo_input = "a";
std::string data_combo_input = "Choice A";

} // namespace

void TestServer::setup()
{
  auto data = builder.data();
  data.add("DataComboInput", std::vector<std::string>{"Choice A", "Choice B", "Choice C", "Obiwan Kenobi"});
  builder.addElement({}, mc_rtc::gui::Label("Time", t_));
  builder.addElement({"Buttons"}, mc_rtc::gui::Button("Hello world", []() { mc_rtc::log::critical("HELLO WORLD!"); }));
  builder.addElement({"Buttons", "Horizontal"}, mc_rtc::gui::ElementsStacking::Horizontal,
                     mc_rtc::gui::Button("1", []() { mc_rtc::log::info("1"); }),
                     mc_rtc::gui::Button("2", []() { mc_rtc::log::info("2"); }),
                     mc_rtc::gui::Button("3", []() { mc_rtc::log::info("3"); }));
  builder.addElement({"Inputs"}, mc_rtc::gui::StringInput("String", str_input),
                     mc_rtc::gui::IntegerInput("IntegerInput", int_input_),
                     mc_rtc::gui::NumberInput("NumberInput", dbl_input),
                     mc_rtc::gui::NumberSlider("NumberSlider", dbl_slide, 0.0, 100.0),
                     mc_rtc::gui::ArrayInput("ArrayInput", v3d_input),
                     mc_rtc::gui::ComboInput("ComboInput", {"a", "b", "c", "d"}, combo_input),
                     mc_rtc::gui::DataComboInput("DataComboInput", {"DataComboInput"}, data_combo_input));
  builder.addElement({"Checkbox"}, mc_rtc::gui::Checkbox("Hello world", checked_));
  builder.addElement({"Labels"}, mc_rtc::gui::Label("Hello", "world"),
                     mc_rtc::gui::ArrayLabel("Time", {"Minutes", "Seconds"},
                                             [this]() -> std::array<double, 2> {
                                               return {std::floor(t_ / 60), std::remainder(t_, 60)};
                                             }));
}

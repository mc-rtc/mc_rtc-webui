#include "TestServer.h"

#include <mc_rbdyn/RobotLoader.h>
#include <mc_rbdyn/Robots.h>

namespace
{

std::shared_ptr<mc_rbdyn::Robots> robots = []()
{
  auto rm = mc_rbdyn::RobotLoader::get_robot_module("JVRC1");
  auto robots = mc_rbdyn::Robots::make();
  robots->load(*rm);
  return robots;
}();
mc_rbdyn::Robot & robot = robots->robot();

bool checked_ = false;
std::string str_input = "Hello world";
int int_input_ = 0;
double dbl_input = 0.0;
double dbl_slide = 50.0;
Eigen::Vector3d v3d_input = Eigen::Vector3d::Zero();
std::string combo_input = "a";
std::string data_combo_input = "Choice A";
Eigen::Vector3d point3d_ro = Eigen::Vector3d::Zero();
Eigen::Vector3d point3d_int = Eigen::Vector3d::Zero();
sva::PTransformd rotation_ro{sva::RotZ(-M_PI), Eigen::Vector3d(1., 1., 0.)};
sva::PTransformd rotation_int{Eigen::Vector3d{0., 0., 1.}};
sva::PTransformd transform_ro{sva::RotZ(-M_PI), Eigen::Vector3d(1., 0., 0.)};
sva::PTransformd transform_int{Eigen::Vector3d{0., 1., 0.}};
Eigen::Vector3d xytheta_int{0., 2., M_PI / 3};
Eigen::VectorXd xythetaz_int;
Eigen::Vector3d arrow_start{0.5, 0.5, 0.};
Eigen::Vector3d arrow_end{0.5, 1., -0.5};
sva::ForceVecd force_force{{0., 0., 0.}, {-50., 50., 100.}};
sva::PTransformd force_pos{Eigen::Vector3d{2, 2, 0}};

struct SelectVisual
{
  std::string selected;
  mc_rtc::gui::Color color = mc_rtc::gui::Color::Red;
  double sphere_radius = 1.0;
  double cylinder_radius = 1.0;
  double cylinder_length = 1.0;
  Eigen::Vector3d box_dim = Eigen::Vector3d::Ones();
  std::string robot_body = "NECK_P_S";
  sva::PTransformd visual_pos = sva::PTransformd::Identity();

  rbd::parsers::Visual visual;

  void addToGUI(mc_rtc::gui::StateBuilder & gui)
  {
    std::vector<std::string> category = {"Visual", "Any"};
    std::vector<std::string> body_choices;
    body_choices.reserve(robot.mb().bodies().size());
    for(const auto & b : robot.mb().bodies())
    {
      if(robot.module()._visual.count(b.name())) { body_choices.push_back(b.name()); }
    }
    gui.addElement(category,
                   mc_rtc::gui::ComboInput(
                       "Choice", {"", "sphere", "box", "cylinder", "mesh"}, [this]() { return selected; },
                       [this, &gui](const std::string & c)
                       {
                         selected = c;
                         addVisualToGUI(gui);
                       }),
                   mc_rtc::gui::NumberInput(
                       "Sphere radius", [this]() { return sphere_radius; },
                       [this](double r)
                       {
                         sphere_radius = r;
                         update_visual();
                       }),
                   mc_rtc::gui::NumberInput(
                       "Cylinder radius", [this]() { return cylinder_radius; },
                       [this](double r)
                       {
                         cylinder_radius = r;
                         update_visual();
                       }),
                   mc_rtc::gui::NumberInput(
                       "Cylinder length", [this]() { return cylinder_length; },
                       [this](double r)
                       {
                         cylinder_length = r;
                         update_visual();
                       }),
                   mc_rtc::gui::ArrayInput(
                       "Box dimensions", [this]() -> const Eigen::Vector3d & { return box_dim; },
                       [this](const Eigen::Vector3d & d)
                       {
                         box_dim = d;
                         update_visual();
                       }),
                   mc_rtc::gui::ArrayInput(
                       "Color", {"r", "g", "b", "a"},
                       [this]() {
                         return std::array<double, 4>{color.r, color.g, color.b, color.a};
                       },
                       [this](const std::array<double, 4> & arr)
                       {
                         color.r = arr[0];
                         color.g = arr[1];
                         color.b = arr[2];
                         color.a = arr[3];
                         update_visual();
                       }),
                   mc_rtc::gui::ComboInput(
                       "body", body_choices, [this]() { return robot_body; },
                       [this, &gui](const std::string & b)
                       {
                         robot_body = b;
                         addVisualToGUI(gui);
                       }));
  }

  void update_visual()
  {
    if(selected == "sphere") { visual = mc_rtc::makeVisualSphere(sphere_radius, color); }
    if(selected == "cylinder") { visual = mc_rtc::makeVisualCylinder(cylinder_radius, cylinder_length, color); }
    if(selected == "box") { visual = mc_rtc::makeVisualBox(box_dim, color); }
  }

  void addVisualToGUI(mc_rtc::gui::StateBuilder & gui)
  {
    std::vector<std::string> category = {"Visual", "Any", "Visual"};
    gui.removeCategory(category);
    if(selected.empty()) { return; }
    update_visual();
    gui.addElement(category, mc_rtc::gui::Transform("Pose", visual_pos));
    if(selected != "mesh")
    {
      gui.addElement(category, mc_rtc::gui::Visual(
                                   "Object", [this]() -> const rbd::parsers::Visual & { return visual; },
                                   [this]() -> const sva::PTransformd & { return visual_pos; }));
    }
    else
    {
      const auto & visuals = robot.module()._visual.at(robot_body);
      for(const auto & v : visuals)
      {
        gui.addElement(category, mc_rtc::gui::Visual(
                                     v.name, [&]() -> const auto & { return v; },
                                     [this]() -> const auto & { return visual_pos; }));
      }
    }
  }
};
SelectVisual select_visual;

} // namespace

void TestServer::setup()
{
  cfg.print_serving_information();
  xythetaz_int.resize(4);
  xythetaz_int << 1., 2., M_PI / 5, 1;
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
  auto setup_3d_element = [this](const std::vector<std::string> & category, auto && element)
  {
    auto name = element.name();
    builder.addElement(category, mc_rtc::gui::Checkbox(
                                     fmt::format("Enable {}", element.name()),
                                     [this, category, name]() { return builder.hasElement(category, name); },
                                     [this, element, category, name]()
                                     {
                                       if(builder.hasElement(category, name)) { builder.removeElement(category, name); }
                                       else { builder.addElement(category, element); }
                                     }));
  };
  auto setup_3d_elements = [&](const std::vector<std::string> & category, auto &&... elements)
  { (setup_3d_element(category, elements), ...); };
  setup_3d_elements({"GUI Markers", "Transform"},
                    mc_rtc::gui::Transform("ReadOnly Transform", [this]() { return transform_ro; }),
                    mc_rtc::gui::Transform(
                        "Interactive Transform", [this]() { return transform_int; },
                        [this](const sva::PTransformd & p) { transform_int = p; }));
  setup_3d_elements({"GUI Markers", "XYTheta"},
                    mc_rtc::gui::XYTheta("XYTheta ReadOnly",
                                         [this]() -> std::array<double, 4> {
                                           return {xytheta_int.x(), xytheta_int.y(), xytheta_int.z(), 0.1};
                                         }),
                    mc_rtc::gui::XYTheta(
                        "XYTheta", [this]() { return xytheta_int; },
                        [this](const Eigen::VectorXd & vec) { xytheta_int = vec.head<3>(); }),
                    mc_rtc::gui::XYTheta(
                        "XYThetaAltitude", [this]() { return xythetaz_int; },
                        [this](const Eigen::VectorXd & vec) { xythetaz_int = vec; }));
  setup_3d_elements({"GUI Markers", "Rotation"},
                    mc_rtc::gui::Rotation("ReadOnly Rotation", [this]() { return rotation_ro; }),
                    mc_rtc::gui::Rotation(
                        "Interactive Rotation", [this]() { return rotation_int; },
                        [this](const Eigen::Quaterniond & q) { rotation_int.rotation() = q; }));

  setup_3d_elements({"GUI Markers", "Point3D"},
                    mc_rtc::gui::Point3DRO("Read only", const_cast<const Eigen::Vector3d &>(point3d_ro)),
                    mc_rtc::gui::Point3D("Interactive", point3d_int));
  mc_rtc::gui::ArrowConfig arrow_config({1., 0., 0.});
  arrow_config.start_point_scale = 0.02;
  arrow_config.end_point_scale = 0.02;
  setup_3d_elements({"GUI Markers", "Arrows"},
                    mc_rtc::gui::Arrow(
                        "ArrowRO", arrow_config,
                        []() {
                          return Eigen::Vector3d{2, 2, 0};
                        },
                        []() {
                          return Eigen::Vector3d{2.5, 2.5, 0.5};
                        }),
                    mc_rtc::gui::Arrow(
                        "Arrow", arrow_config, [this]() { return arrow_start; },
                        [this](const Eigen::Vector3d & start) { arrow_start = start; }, [this]() { return arrow_end; },
                        [this](const Eigen::Vector3d & end) { arrow_end = end; }),
                    mc_rtc::gui::Force(
                        "ForceRO", mc_rtc::gui::ForceConfig(mc_rtc::gui::Color(1., 0., 0.)),
                        []() {
                          return sva::ForceVecd(Eigen::Vector3d{0., 0., 0.}, Eigen::Vector3d{10., 0., 100.});
                        },
                        []() {
                          return sva::PTransformd{Eigen::Vector3d{2, 2, 0}};
                        }),
                    mc_rtc::gui::Force(
                        "Force", mc_rtc::gui::ForceConfig(mc_rtc::gui::Color(0., 1., 0.)),
                        [this]() { return force_force; }, [this](const sva::ForceVecd & force) { force_force = force; },
                        []() { return force_pos; }),
                    mc_rtc::gui::Transform("Force frame", force_pos));
  setup_3d_elements(
      {"Visual", "Ellipsoid"},
      mc_rtc::gui::Ellipsoid(
          "Fixed size/Fixed color", Eigen::Vector3d(0.25, 0.5, 1.0),
          []() { return sva::PTransformd(Eigen::Vector3d(-4, 0, 1)); }, mc_rtc::gui::Color::Blue),
      mc_rtc::gui::Ellipsoid(
          "Fixed size/Varying color", Eigen::Vector3d(0.25, 0.5, 1.0),
          []() { return sva::PTransformd(Eigen::Vector3d(-4, 1, 1)); },
          [this]()
          {
            auto color = mc_rtc::gui::Color::Yellow;
            color.a = (1 + cos(t_)) / 2;
            return color;
          }),
      mc_rtc::gui::Ellipsoid(
          "Varying size/Fixed color",
          [this]() -> Eigen::Vector3d { return Eigen::Vector3d(0.25, 0.5, 1.0) * (1 + (1 + cos(t_)) / 2); },
          []() { return sva::PTransformd(Eigen::Vector3d(-4, 2, 1)); }),
      mc_rtc::gui::Ellipsoid(
          "Varying size/Varying color",
          [this]() -> Eigen::Vector3d { return Eigen::Vector3d(0.25, 0.5, 1.0) * (1 + (1 + sin(t_)) / 2); },
          []() { return sva::PTransformd(Eigen::Vector3d(-4, 3, 1)); },
          [this]()
          {
            auto color = mc_rtc::gui::Color::Green;
            color.a = (1 + sin(t_)) / 2;
            return color;
          }));
  setup_3d_elements({"Visual", "Cylinder"},
                    mc_rtc::gui::Cylinder(
                        "Fixed size/Fixed color", {0.125, 1.0},
                        []() { return sva::PTransformd(Eigen::Vector3d(-3, 0, 1)); }, mc_rtc::gui::Color::Blue),
                    mc_rtc::gui::Cylinder(
                        "Fixed size/Varying color", {0.125, 1.0},
                        []() { return sva::PTransformd(Eigen::Vector3d(-3, 1, 1)); },
                        [this]()
                        {
                          auto color = mc_rtc::gui::Color::Yellow;
                          color.a = (1 + cos(t_)) / 2;
                          return color;
                        }),
                    mc_rtc::gui::Cylinder(
                        "Varying size/Fixed color",
                        [this]() -> mc_rtc::gui::CylinderParameters
                        {
                          double m = (1 + (1 + cos(t_)) / 2);
                          return {0.125 * m, 0.5 * m};
                        },
                        []() { return sva::PTransformd(Eigen::Vector3d(-3, 2, 1)); }),
                    mc_rtc::gui::Cylinder(
                        "Varying size/Varying color",
                        [this]() -> mc_rtc::gui::CylinderParameters
                        {
                          double m = (1 + (1 + sin(t_)) / 2);
                          return {0.125 * m, 0.5 * m};
                        },
                        []() { return sva::PTransformd(Eigen::Vector3d(-3, 3, 1)); },
                        [this]()
                        {
                          auto color = mc_rtc::gui::Color::Green;
                          color.a = (1 + sin(t_)) / 2;
                          return color;
                        }));
  setup_3d_elements(
      {"Visual", "Box"},
      mc_rtc::gui::Box(
          "Fixed size/Fixed color", Eigen::Vector3d(0.25, 0.5, 1.0),
          []() { return sva::PTransformd(Eigen::Vector3d(-2, 0, 1)); }, mc_rtc::gui::Color::Blue),
      mc_rtc::gui::Box(
          "Fixed size/Varying color", Eigen::Vector3d(0.25, 0.5, 1.0),
          []() { return sva::PTransformd(Eigen::Vector3d(-2, 1, 1)); },
          [this]()
          {
            auto color = mc_rtc::gui::Color::Yellow;
            color.a = (1 + cos(t_)) / 2;
            return color;
          }),
      mc_rtc::gui::Box(
          "Varying size/Fixed color",
          [this]() -> Eigen::Vector3d { return Eigen::Vector3d(0.25, 0.5, 1.0) * (1 + (1 + cos(t_)) / 2); },
          []() { return sva::PTransformd(Eigen::Vector3d(-2, 2, 1)); }),
      mc_rtc::gui::Box(
          "Varying size/Varying color",
          [this]() -> Eigen::Vector3d { return Eigen::Vector3d(0.25, 0.5, 1.0) * (1 + (1 + sin(t_)) / 2); },
          []() { return sva::PTransformd(Eigen::Vector3d(-2, 3, 1)); },
          [this]()
          {
            auto color = mc_rtc::gui::Color::Green;
            color.a = (1 + sin(t_)) / 2;
            return color;
          }));
  setup_3d_elements({"Visual", "Sphere"},
                    mc_rtc::gui::Sphere(
                        "Fixed radius/Fixed color", 0.25, []() { return sva::PTransformd(Eigen::Vector3d(-1, 0, 1)); },
                        mc_rtc::gui::Color::Blue),
                    mc_rtc::gui::Sphere(
                        "Fixed radius/Varying color", 0.25,
                        []() { return sva::PTransformd(Eigen::Vector3d(-1, 1, 1)); },
                        [this]()
                        {
                          auto color = mc_rtc::gui::Color::Yellow;
                          color.a = (1 + cos(t_)) / 2;
                          return color;
                        }),
                    mc_rtc::gui::Sphere(
                        "Varying radius/Fixed color", [this]() { return 0.25 * (1 + (1 + cos(t_)) / 2); },
                        []() { return sva::PTransformd(Eigen::Vector3d(-1, 2, 1)); }),
                    mc_rtc::gui::Sphere(
                        "Varying radius/Varying color", [this]() { return 0.25 * (1 + (1 + sin(t_)) / 2); },
                        []() { return sva::PTransformd(Eigen::Vector3d(-1, 3, 1)); },
                        [this]()
                        {
                          auto color = mc_rtc::gui::Color::Green;
                          color.a = (1 + sin(t_)) / 2;
                          return color;
                        }));
  select_visual.addToGUI(builder);
  builder.addElement({"Checkbox"}, mc_rtc::gui::Checkbox("Hello world", checked_));
  builder.addElement({"Labels"}, mc_rtc::gui::Label("Hello", "world"),
                     mc_rtc::gui::ArrayLabel("Time", {"Minutes", "Seconds"},
                                             [this]() -> std::array<double, 2> {
                                               return {std::floor(t_ / 60), std::remainder(t_, 60)};
                                             }));
}

#include "ModelStore.h"

#include <boost/filesystem.hpp>
namespace bfs = boost::filesystem;

#ifdef MC_RTC_HAS_ROS
#include <ros/package.h>
#endif

#include <mc_rtc/logging.h>

// FIXME Use std::system calls to do model conversion for now
#include <cstdlib>

std::string resolve_uri(const std::string & uri)
{
#ifdef MC_RTC_HAS_ROS
  std::string package_header = "package://";
  if(uri.size() > package_header.size() && uri.substr(0, package_header.size()) == package_header)
  {
    std::string out = uri.substr(package_header.size());
    auto pos = out.find('/');
    if(pos == std::string::npos)
    {
      return "";
    }
    return ros::package::getPath(out.substr(0, pos)) + out.substr(pos);
  }
#endif
  std::string file_header = "file://";
  if(uri.size() > file_header.size() && uri.substr(0, file_header.size()) == file_header)
  {
    return uri.substr(file_header.size());
  }
  return uri;
}

const std::string & ModelStore::get_model(const std::string & uri) 
{
  auto it = uriToGLTF.find(uri);
  if(it != uriToGLTF.end())
  {
    return it->second;
  }
  auto real = bfs::path(resolve_uri(uri));
  if(!bfs::exists(real))
  {
    mc_rtc::log::error("Requested model {} (resolved from uri: {}) but this file does not exist", real.string(), uri);
    uriToGLTF[uri] = "";
  }
  else if(real.extension() == ".gltf")
  {
    uriToGLTF[uri] = real.string();
  }
  else if(real.extension() == ".dae")
  {
    // FIXME This is good enough for now but we need to carry permanent conversion storage in the future
    std::string out = fmt::format("/tmp/{}.gltf", real.stem().string());
    std::string cmd = fmt::format("COLLADA2GLTF-bin -i {} -o {}", real.string(), out);
    auto ret = std::system(cmd.c_str());
    if(ret != 0)
    {
      mc_rtc::log::error("Conversion failed, command was: {}", cmd);
      uriToGLTF[uri] = "";
    }
    else
    {
      uriToGLTF[uri] = out;
    }
  }
  else
  {
    mc_rtc::log::error("Cannot convert {} to gltf format", real.string());
  }
  return uriToGLTF.at(uri);
}

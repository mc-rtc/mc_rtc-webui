#pragma once

#include <unordered_map>

/** Keep track of loaded and converted models */
struct ModelStore
{
  const std::string & get_model(const std::string & uri);
private:
  /** Map requested URI to GLTF file, returns an empty string if conversion is not possible */
  std::unordered_map<std::string, std::string> uriToGLTF;
};



#include "cs599_Timer.h"

#include "editor/editor_node.h"
#include "editor/editor_log.h"

CS599_Timer::TimePointType CS599_Timer::start;
CS599_Timer::TimePointType CS599_Timer::end;
bool CS599_Timer::isActive = false;

std::map<std::string, std::vector<long long>> CS599_Timer::recordings;
std::string CS599_Timer::currentRecording;

//	std::string message = std::to_string(getTime().count());
//	EditorNode::get_singleton()->get_log()->add_message(message.c_str());

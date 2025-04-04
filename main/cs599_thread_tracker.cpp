

#include "cs599_thread_tracker.h"

#include "editor/editor_node.h"
#include "editor/editor_log.h"

CS599_Timer::TimePointType CS599_Timer::start;
CS599_Timer::TimePointType CS599_Timer::end;

void beginTrackThreads() {

}

void endTrackThreads() {

}

//void CS599_Timer::printToEditorConsole() {
//	std::string message = std::to_string(getTime().count());
//	EditorNode::get_singleton()->get_log()->add_message(message.c_str());
//}

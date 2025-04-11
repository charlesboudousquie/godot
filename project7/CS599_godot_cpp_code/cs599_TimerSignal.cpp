#include "cs599_TimerSignal.h"

#include "cs599_Timer.h"

#include "servers/physics_server_3d.h"

#include "core/config/project_settings.h"

#include <fstream>

//#include "editor/editor_node.h"
//#include "editor/editor_log.h"
//	std::string message = std::to_string(getTime().count());
//	EditorNode::get_singleton()->get_log()->add_message(message.c_str());

void CS599TimerSignal::_bind_methods() {
	ClassDB::bind_method(D_METHOD("startRecording"), &CS599TimerSignal::startRecording);
	ClassDB::bind_method(D_METHOD("endRecording"), &CS599TimerSignal::endRecording);
	ClassDB::bind_method(D_METHOD("saveToCSV"), &CS599TimerSignal::saveToCSV);
	ClassDB::bind_method(D_METHOD("clearRecords"), &CS599TimerSignal::clearRecords);
	ClassDB::bind_method(D_METHOD("setFileSuffix"), &CS599TimerSignal::setFileSuffix);
}

void CS599TimerSignal::clearRecords() {
	CS599_Timer::clear();
}

void CS599TimerSignal::startRecording(String message) {
	print_line("beginning recording");
	CS599_Timer::currentSession = message.utf8().get_data();
	CS599_Timer::isActive = true;
}

void CS599TimerSignal::endRecording() {
	print_line("ending recording");
	CS599_Timer::isActive = false;
}

void CS599TimerSignal::saveToCSV() {
	print_line("saving time step recordings to file");

	// Get the physics manager that works
	auto manager = PhysicsServer3DManager::get_singleton();
	auto serverId = manager->find_server_id(GLOBAL_GET(PhysicsServer3DManager::setting_property_name));
	auto serverName = manager->get_server_name(serverId);
	print_line(vformat("server is: %s", serverName));

	bool result;

	if (serverName == "Jolt Physics") {
		result = CS599_Timer::saveToCSV("jolt_physics_timer_recordings");
	} else {
		result = CS599_Timer::saveToCSV("default_physics_timer_recordings");
	}

	if (!result) {
		print_line("csv failed!");
	}
}

#pragma once

#include "scene/main/node.h"

#include "cs599_Timer.h"

class CS599TimerSignal : public Node {
	GDCLASS(CS599TimerSignal, Node);

protected:
	static void _bind_methods();

public:

	// recording for differing number of cubes
	void clearRecords();
	void startRecording(String message);
	void endRecording();
	void saveToCSV();
	void setFileSuffix(String suffix) {
		CS599_Timer::fileSuffix = suffix.utf8().get_data();
	}

	CS599TimerSignal() {}
};

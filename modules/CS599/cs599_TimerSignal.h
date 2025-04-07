#pragma once

#include "scene/main/node.h"

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

	CS599TimerSignal() {}
};

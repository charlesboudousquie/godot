#pragma once

#include "scene/main/node.h"

class CS599TimerSignal : public Node {
	GDCLASS(CS599TimerSignal, Node);

protected:
	static void _bind_methods();

public:
	// recording for differing number of cubes
	void startRecording();
	void endRecording();

	CS599TimerSignal() {}
};

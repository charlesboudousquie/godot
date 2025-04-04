#include "cs599_TimerSignal.h"

#include "main/cs599_Timer.h"

void CS599TimerSignal::_bind_methods() {
	ClassDB::bind_method(D_METHOD("startRecording"), &CS599TimerSignal::startRecording);
	ClassDB::bind_method(D_METHOD("endRecording"), &CS599TimerSignal::endRecording);
}

void CS599TimerSignal::startRecording() {
	print_line("beginning recording");
	CS599_Timer::isActive = true;
}

void CS599TimerSignal::endRecording() {
	print_line("ending recording");
	CS599_Timer::isActive = false;
}

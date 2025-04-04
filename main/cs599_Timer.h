#pragma once

#include <chrono>

class CS599_Timer {
public:
	// std::chrono::milliseconds is a "duration" of 1/1000 seconds which
	// means its a millisecond.

	using ClockType = std::chrono::steady_clock;
	using TimePointType = ClockType::time_point;
	using TimeType = std::chrono::milliseconds;

	static TimePointType start;
	static TimePointType end;

	static bool isActive;

	static void startStepRecording() {
		start = ClockType::now();
	}

	static void endStepRecording() {
		end = ClockType::now();
	}

	static auto getTime() {
		return std::chrono::duration_cast<TimeType>(end - start);
	}

	static auto getTimeCount() {
		return getTime().count();
	}

};

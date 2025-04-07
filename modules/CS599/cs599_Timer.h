#pragma once

#include <chrono>
#include <map>
#include <vector>

class CS599_Timer {
public:
	// std::chrono::milliseconds is a "duration" of 1/1000 seconds which
	// means its a millisecond.

	using ClockType = std::chrono::steady_clock;
	using TimePointType = ClockType::time_point;
	using TimeType = std::chrono::milliseconds;

	static TimePointType start;
	static TimePointType end;

	static std::map<std::string, std::vector<long long>> recordings;

	static bool isActive;

	static std::string currentRecording;

	static void clear() {
		recordings = {};
		currentRecording = {};
		isActive = false;
	}

	static void startStepRecording() {
		start = ClockType::now();
	}

	static void endStepRecording() {
		end = ClockType::now();
		saveRecording();
	}

	static void saveRecording() {
		recordings[currentRecording].push_back(getTimeCount());
	}

	static auto getTime() {
		return std::chrono::duration_cast<TimeType>(end - start);
	}

	static long long getTimeCount() {
		return getTime().count();
	}

};

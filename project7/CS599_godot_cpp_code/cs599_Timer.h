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

	// Start time before timing a block of code for a particular frame.
	static TimePointType start;
	// End time after timing a block of code.
	static TimePointType end;

	static bool isActive;

	// A mapping of sessions to their recorded timings.
	static std::map<std::string, std::vector<long long>> recordings;

	// Name of current recording session
	static std::string currentSession;

	// Suffix to append to file when saving to disk
	static std::string fileSuffix;

	static void clear() {
		isActive = false;
		recordings = {};
		currentSession = {};
		fileSuffix = {};
	}

	static void startStepRecording() {
		start = ClockType::now();
	}

	static void endStepRecording() {
		end = ClockType::now();
		saveRecording();
	}

	static void saveRecording() {
		recordings[currentSession].push_back(getTimeCount());
	}

	static auto getTime() {
		return std::chrono::duration_cast<TimeType>(end - start);
	}

	static long long getTimeCount() {
		return getTime().count();
	}

	static bool saveToCSV(const std::string& fileName);

};

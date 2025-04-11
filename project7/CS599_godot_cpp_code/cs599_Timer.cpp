

#include "cs599_Timer.h"

#include <fstream>
#include <algorithm>
#include <filesystem>

namespace fs = std::filesystem;

CS599_Timer::TimePointType CS599_Timer::start;
CS599_Timer::TimePointType CS599_Timer::end;
bool CS599_Timer::isActive = false;

std::map<std::string, std::vector<long long>> CS599_Timer::recordings;
std::string CS599_Timer::currentSession;
std::string CS599_Timer::fileSuffix;

bool CS599_Timer::saveToCSV(const std::string &fileName) {

	std::vector<std::string> columnNames;

	for (const auto &recording : CS599_Timer::recordings) {
		columnNames.push_back(recording.first);
	}

	//std::sort(columnNames.begin(), columnNames.end());

	if (!fs::exists("recordings")) {
		fs::create_directory("recordings");
	}

	std::string path = "recordings/" + fileName + fileSuffix + ".csv";

	std::ofstream csvFile(path);
	const int columns = columnNames.size();

	size_t maxRecordings = 0;

	for (const auto &recording : CS599_Timer::recordings) {
		maxRecordings = std::max(maxRecordings, recording.second.size());
	}

	// create column headers
	for (int i = 0; i < columns; i++) {
		//print_line(columnNames[i].c_str());
		csvFile << columnNames[i];
		if (i < columns - 1) {
			csvFile << ", ";
		}
	}
	csvFile << "\n";

	//print_line(vformat("max recordings: %d", maxRecordings));
	// for each row
	for (int row = 0; row < maxRecordings; row++) {
		// create row
		for (int col = 0; col < columns; col++) {
			const auto &columnName = columnNames[col];
			const auto &data = CS599_Timer::recordings.at(columnName);
			// If there is a value to record(not all recordings are of same length)
			if (data.size() > row) {
				csvFile << data[row];
				if (col < columns - 1) {
					csvFile << ", ";
				}
			} else {
				// its a blank
				csvFile << ", ";
			}
		}

		csvFile << "\n";
	}

	csvFile.close();

	return !csvFile.fail();
}

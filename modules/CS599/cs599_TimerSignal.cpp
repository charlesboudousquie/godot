#include "cs599_TimerSignal.h"

#include "cs599_Timer.h"

#include <fstream>

void CS599TimerSignal::_bind_methods() {
	ClassDB::bind_method(D_METHOD("startRecording"), &CS599TimerSignal::startRecording);
	ClassDB::bind_method(D_METHOD("endRecording"), &CS599TimerSignal::endRecording);
	ClassDB::bind_method(D_METHOD("saveToCSV"), &CS599TimerSignal::saveToCSV);
	ClassDB::bind_method(D_METHOD("clearRecords"), &CS599TimerSignal::clearRecords);
}

void CS599TimerSignal::clearRecords() {
	CS599_Timer::clear();
}

void CS599TimerSignal::startRecording(String message) {
	print_line("beginning recording");
	CS599_Timer::currentRecording = message.utf8().get_data();
	/*auto debugMessage = "currently recording for: " + CS599_Timer::currentRecording;
	print_line(debugMessage.c_str());*/
	CS599_Timer::isActive = true;
}

void CS599TimerSignal::endRecording() {
	print_line("ending recording");
	/*auto debugMessage = "ending recording for: " + CS599_Timer::currentRecording;
	print_line(debugMessage.c_str());*/
	CS599_Timer::isActive = false;
}

void CS599TimerSignal::saveToCSV() {
	print_line("saving time step recordings to file");

	// todo: figure out sorting of column names.
	std::vector<std::string> columnNames;

	for (const auto& recording : CS599_Timer::recordings) {
		columnNames.push_back(recording.first);
	}

	std::sort(columnNames.begin(), columnNames.end());

	std::ofstream csvFile("timer_recordings.csv");
	const int columns = columnNames.size();

	size_t maxRecordings = 0;

	for (const auto &recording : CS599_Timer::recordings) {
		maxRecordings = std::max(maxRecordings, recording.second.size());
	}

	// create column headers
	for (int i = 0; i < columns; i++) {
		print_line(columnNames[i].c_str());
		csvFile << columnNames[i];
		if (i < columns - 1) {
			csvFile << ", ";
		}
	}
	csvFile << "\n";


	print_line(vformat("max recordings: %d", maxRecordings));
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

	if (csvFile.fail()) {
		print_line("csv failed!");
	}
}

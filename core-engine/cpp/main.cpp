#include "DeviceController.hpp"
#include <iostream>

int main() {
    std::cout << "=========================================================" << std::endl;
    std::cout << "SECUREWIPE PRO - C++20 HIGH-PERFORMANCE CONTROLLER TEST" << std::endl;
    std::cout << "=========================================================" << std::endl;

    SecureWipe::DeviceController controller;
    auto drives = controller.scanConnectedDrives();

    for (const auto& drive : drives) {
        std::cout << "Found Drive: " << drive.devicePath 
                  << " | Model: " << drive.model 
                  << " | Serial: " << drive.serialNumber 
                  << " | Bus: " << drive.busType << std::endl;
    }

    auto result = controller.executeHardwarePurge(drives[0].devicePath, "NIST_SP_800_88_REV1_PURGE");
    std::cout << "Execution Success: " << (result.success ? "YES" : "NO") << std::endl;
    std::cout << "Throughput: " << result.throughputMBps << " MB/s" << std::endl;
    std::cout << "Verification Hash: " << result.verificationHashHex << std::endl;

    return 0;
}

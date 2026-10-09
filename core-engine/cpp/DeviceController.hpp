#pragma once

#include <string>
#include <vector>
#include <memory>
#include <cstdint>

namespace SecureWipe {

struct PhysicalDriveMetadata {
    std::string devicePath;
    std::string serialNumber;
    std::string model;
    std::string busType;
    uint64_t totalCapacityBytes;
    bool isNvme;
    bool isSystemDrive;
};

struct PurgeExecutionResult {
    bool success;
    uint64_t bytesSanitized;
    double durationSeconds;
    double throughputMBps;
    std::string verificationHashHex;
    std::string standardApplied;
};

class DeviceController {
public:
    DeviceController();
    ~DeviceController();

    std::vector<PhysicalDriveMetadata> scanConnectedDrives();
    PurgeExecutionResult executeHardwarePurge(const std::string& devicePath, const std::string& algorithmStandard);

private:
    bool verifyDriveSafetyLock(const std::string& path);
    void forceHardwareCacheFlush(int fd);
};

} // namespace SecureWipe

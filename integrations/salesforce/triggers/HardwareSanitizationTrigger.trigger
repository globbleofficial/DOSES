/**
 * SECUREWIPE PRO - APEX HARDWARE ASSET AUDIT TRIGGER
 */
trigger HardwareSanitizationTrigger on Asset (before update) {
    for (Asset a : Trigger.new) {
        Asset oldAsset = Trigger.oldMap.get(a.Id);
        if (a.Status == 'Decommissioned - Sanitized' && oldAsset.Status != 'Decommissioned - Sanitized') {
            // Audit check: Verify description contains cryptographic verification hash
            if (a.Description == null || !a.Description.contains('Cert ID:')) {
                a.addError('Compliance Error: Asset cannot be set to Decommissioned without an attached SecureWipe Certificate ID.');
            }
        }
    }
}

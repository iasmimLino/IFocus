package com.ifocus.ifocus.Update;

public class UpdateInfo {

    private String version;
    private String downloadUrl;
    private boolean mandatory;

    public String getVersion() {
        return version;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public boolean isMandatory() {
        return mandatory;
    }
}
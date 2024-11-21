package com.example.app;

import android.content.res.Configuration;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemTheme")
public class SystemThemePlugin extends Plugin {

  @PluginMethod
  public void getSystemDarkMode(PluginCall call) {
    Log.d("SystemThemePlugin", "getSystemDarkMode called");
    int nightModeFlags = getContext().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
    boolean isDarkMode = (nightModeFlags == Configuration.UI_MODE_NIGHT_YES);

    JSObject result = new JSObject();
    result.put("isDarkMode", isDarkMode);
    Log.d("SystemThemePlugin", "Dark mode: " + isDarkMode);
    call.resolve(result);
  }
}

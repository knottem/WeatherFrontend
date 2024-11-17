package com.example.app;

import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  private SharedPreferences.OnSharedPreferenceChangeListener preferenceChangeListener;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Apply the initial theme based on current preference
    checkAndApplyDarkModeSetting();

    SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
    preferenceChangeListener = (sharedPreferences, key) -> {
      if ("darkMode".equals(key)) {
        checkAndApplyDarkModeSetting(); // Apply the updated theme when `darkMode` changes
      }
    };
    prefs.registerOnSharedPreferenceChangeListener(preferenceChangeListener);
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
    prefs.unregisterOnSharedPreferenceChangeListener(preferenceChangeListener);
  }

  @Override
  public void onResume() {
    super.onResume();
    checkAndApplyDarkModeSetting();
  }

  private void checkAndApplyDarkModeSetting() {
    SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
    boolean isDarkMode = false;
    if (prefs.contains("darkMode")) {
      isDarkMode = Boolean.parseBoolean(prefs.getString("darkMode", "false"));
    }
    Log.d("MainActivity", "checkAndApplyDarkModeSetting: Dark mode is " + isDarkMode);
    setNavigationBarColor(isDarkMode);
  }

  private void setNavigationBarColor(boolean isDarkMode) {
    Window window = getWindow();
    int options = window.getDecorView().getSystemUiVisibility() | WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS;

    if (isDarkMode) {
      window.setNavigationBarColor(Color.parseColor("#222428")); // Dark mode color
      options &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR; // Light icons on dark background
    } else {
      window.setNavigationBarColor(Color.parseColor("#F4F5F8")); // Light mode color
      setTheme(R.style.AppTheme);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        options |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR; // Dark icons on light background
      }
    }

    window.getDecorView().setSystemUiVisibility(options);
  }
}

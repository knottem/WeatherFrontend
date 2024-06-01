package com.example.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      String color = "#F4F5F8";
      Boolean darkButtons = true;

      Window window = getWindow();
      int options = window.getDecorView().getSystemUiVisibility() | WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS;

      if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && darkButtons) {
        options |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
      } else {
        options &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
      }

      window.getDecorView().setSystemUiVisibility(options);
      window.setNavigationBarColor(Color.parseColor(color));
    }
  }
}

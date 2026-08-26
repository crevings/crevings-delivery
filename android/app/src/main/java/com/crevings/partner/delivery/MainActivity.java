package com.crevings.partner.delivery;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppSettingsPlugin.class);
        registerPlugin(LocationSettingsPlugin.class);
        super.onCreate(savedInstanceState);

        makeStatusBarTransparentAndNavLight();
        setupCleanEdgeToEdgeLayout();
    }

    /**
     * Edge-to-edge transparent status bar allowing the app layout to shine through dynamically.
     */
    private void makeStatusBarTransparentAndNavLight() {
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);

        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.WHITE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setStatusBarContrastEnforced(false);
            window.setNavigationBarContrastEnforced(true);
        }

        WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(true);
        controller.setAppearanceLightNavigationBars(true);
    }

    /**
     * Allow WebView to extend behind status bar while padding bottom navigation / keyboard.
     */
    private void setupCleanEdgeToEdgeLayout() {
        getBridge().getWebView().post(() -> {
            View webViewParent = (View) getBridge().getWebView().getParent();
            webViewParent.setBackgroundColor(Color.TRANSPARENT);
            getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);

            ViewCompat.setOnApplyWindowInsetsListener(webViewParent, (v, insets) -> {
                Insets systemBars = insets.getInsets(
                        WindowInsetsCompat.Type.systemBars()
                                | WindowInsetsCompat.Type.displayCutout());
                Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
                boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

                int bottomPadding = keyboardVisible ? ime.bottom : systemBars.bottom;
                v.setPadding(0, 0, 0, bottomPadding);
                return insets;
            });
            webViewParent.requestApplyInsets();
        });
    }
}

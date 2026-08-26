package com.crevings.partner.delivery;

import android.app.Activity;
import android.content.Intent;
import android.provider.Settings;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResponse;
import com.google.android.gms.location.Priority;
import com.google.android.gms.location.SettingsClient;
import com.google.android.gms.tasks.Task;

/**
 * Native Capacitor plugin that prompts the user to enable GPS / Location
 * Services via the Google Play Services in-app dialog (the same dialog
 * shown by Google Maps, Uber, etc.).
 *
 * If Play Services is unavailable, falls back to opening the
 * system Location Settings screen.
 *
 * Registered in MainActivity.onCreate().
 */
@CapacitorPlugin(name = "LocationSettings")
public class LocationSettingsPlugin extends Plugin {

    private ActivityResultLauncher<IntentSenderRequest> locationSettingsLauncher;

    @Override
    public void load() {
        locationSettingsLauncher = getActivity().getActivityResultRegistry().register(
            "location_settings_resolution",
            new ActivityResultContracts.StartIntentSenderForResult(),
            result -> {
                PluginCall savedCall = getSavedCall();
                if (savedCall == null) return;

                if (result.getResultCode() == Activity.RESULT_OK) {
                    savedCall.resolve();
                } else {
                    savedCall.reject("User declined to enable location services");
                }
            }
        );
    }

    /**
     * Shows the Google Play Services in-app location-enable dialog.
     * If location is already enabled, resolves immediately.
     */
    @PluginMethod()
    public void openLocationSettings(PluginCall call) {
        saveCall(call);

        LocationRequest locationRequest = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY, 10000)
                .setMinUpdateIntervalMillis(5000)
                .build();

        LocationSettingsRequest settingsRequest = new LocationSettingsRequest.Builder()
                .addLocationRequest(locationRequest)
                .setAlwaysShow(true)
                .build();

        SettingsClient settingsClient = LocationServices.getSettingsClient(getContext());
        Task<LocationSettingsResponse> task = settingsClient.checkLocationSettings(settingsRequest);

        task.addOnSuccessListener(getActivity(), response -> {
            PluginCall saved = getSavedCall();
            if (saved != null) {
                saved.resolve();
            }
        });

        task.addOnFailureListener(getActivity(), e -> {
            if (e instanceof ResolvableApiException) {
                try {
                    ResolvableApiException resolvable = (ResolvableApiException) e;
                    IntentSenderRequest intentSenderRequest =
                            new IntentSenderRequest.Builder(resolvable.getResolution()).build();
                    locationSettingsLauncher.launch(intentSenderRequest);
                } catch (Exception ex) {
                    fallbackToSystemSettings(call);
                }
            } else {
                fallbackToSystemSettings(call);
            }
        });
    }

    private void fallbackToSystemSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception ex) {
            call.reject("Could not open location settings", ex);
        }
    }
}

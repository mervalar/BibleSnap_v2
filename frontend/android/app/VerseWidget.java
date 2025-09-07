package com.mer.bibleapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONObject;

public class VerseWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Get verse from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences("RCTAsyncLocalStorage_V1", Context.MODE_PRIVATE);
        String verseJson = prefs.getString("verseOfTheDay", "");

        String verseText = "Tap to open BibleSnap";
        String verseRef = "";

        try {
            JSONObject obj = new JSONObject(verseJson);
            verseText = obj.getString("text");
            verseRef = obj.getString("reference");
        } catch (Exception e) {
            // Use default text if no verse found
        }

        // Create widget layout
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.verse_widget);
        views.setTextViewText(R.id.verse_text, verseText);
        views.setTextViewText(R.id.verse_ref, verseRef);

        // Create intent to open app when widget is clicked
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

        // Update widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
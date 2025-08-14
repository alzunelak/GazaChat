package com.example.chatbt.data

import android.content.Context
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject

object Store {
    private const val PREF = "chatbt_prefs"
    private const val KEY_PROFILE = "profile"
    private const val KEY_FRIENDS = "friends"
    private const val KEY_LAST_FRIEND = "last_friend"

    fun saveProfile(ctx: Context, p: UserProfile) {
        val o = JSONObject().apply {
            put("username", p.username)
            put("publicKeyPem", p.publicKeyPem)
            put("photoBase64", p.photoBase64)
        }
        ctx.getSharedPreferences(PREF, 0).edit().putString(KEY_PROFILE, o.toString()).apply()
    }

    fun loadProfile(ctx: Context): UserProfile? {
        val s = ctx.getSharedPreferences(PREF, 0).getString(KEY_PROFILE, null) ?: return null
        val o = JSONObject(s)
        return UserProfile(
            o.getString("username"),
            o.getString("publicKeyPem"),
            if (o.isNull("photoBase64")) null else o.getString("photoBase64")
        )
    }

    fun saveFriend(ctx: Context, f: Friend) {
        val arr = JSONArray(getFriendsRaw(ctx))
        val o = JSONObject().apply {
            put("id", f.id)
            put("username", f.username)
            put("publicKeyPem", f.publicKeyPem)
        }
        arr.put(o)
        ctx.getSharedPreferences(PREF,0).edit().putString(KEY_FRIENDS, arr.toString()).apply()
    }

    fun listFriends(ctx: Context): List<Friend> {
        val arr = JSONArray(getFriendsRaw(ctx))
        return List(arr.length()) { i ->
            val o = arr.getJSONObject(i)
            Friend(o.getString("id"), o.getString("username"), o.getString("publicKeyPem"))
        }
    }

    private fun getFriendsRaw(ctx: Context): String {
        return ctx.getSharedPreferences(PREF,0).getString(KEY_FRIENDS, "[]")!!
    }

    fun setLastFriend(ctx: Context, friend: Friend) {
        val o = JSONObject().apply {
            put("id", friend.id)
            put("username", friend.username)
            put("publicKeyPem", friend.publicKeyPem)
        }
        ctx.getSharedPreferences(PREF,0).edit().putString(KEY_LAST_FRIEND, o.toString()).apply()
    }

    fun getLastFriend(ctx: Context): Friend? {
        val s = ctx.getSharedPreferences(PREF,0).getString(KEY_LAST_FRIEND, null) ?: return null
        val o = JSONObject(s)
        return Friend(o.getString("id"), o.getString("username"), o.getString("publicKeyPem"))
    }
}

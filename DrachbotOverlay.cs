using System;
using System.IO;
using System.Linq;
using BepInEx;
using BepInEx.Logging;
using UnityEngine;

namespace DrachbotOverlay
{
    using P = Plugin;

    [BepInProcess("Legion TD 2.exe")]
    [BepInPlugin(PluginInfo.PLUGIN_GUID, PluginInfo.PLUGIN_NAME, PluginInfo.PLUGIN_VERSION)]
    public class Plugin : BaseUnityPlugin
    {
        internal new static ManualLogSource Logger;
        private string _gatewayFileAbs;
        private string _gatewayBackupFileAbs;
        private string _loadingViewsFileAbs;
        private string _loadingViewsBackupFileAbs;
        private string _profileViewsFileAbs;
        private string _profileViewsBackupFileAbs;
        private string _drachbotFileAbs;

        // When the plugin is loaded
        public void Awake() {
            // Create masking Logger as internal to use more easily in code
            Logger = base.Logger;

            // Get paths to game js folder and to our future modded gateway
            _gatewayFileAbs =
                Path.Combine(Paths.GameRootPath, "Legion TD 2_Data", "uiresources", "AeonGT", "gateway.html");
            _gatewayBackupFileAbs =
                Path.Combine(Paths.GameRootPath, "Legion TD 2_Data", "uiresources", "AeonGT", "gateway-backup.html");
            _loadingViewsFileAbs =
                Path.Combine(Paths.GameRootPath, "Legion TD 2_Data", "uiresources", "AeonGT", "hud", "js", "loading-views.js");
            _loadingViewsBackupFileAbs =
                Path.Combine(Paths.GameRootPath, "Legion TD 2_Data", "uiresources", "AeonGT", "hud", "js", "loading-views-backup.js");
            _profileViewsFileAbs =
                Path.Combine(Paths.GameRootPath, "Legion TD 2_Data", "uiresources", "AeonGT", "hud", "js", "profile-views.js");
            _profileViewsBackupFileAbs =
                Path.Combine(Paths.GameRootPath, "Legion TD 2_Data", "uiresources", "AeonGT", "hud", "js", "profile-views-backup.js");
            _drachbotFileAbs =
                Path.Combine(Paths.GameRootPath, "Legion TD 2_Data", "uiresources", "AeonGT", "hud", "js", "drachbot-views.js");
            // Inject custom js and patch c#
            try {
                CleanUp();
                ReplaceFiles();
            }
            catch (Exception e) {
                Logger.LogError($"Error while injecting or patching: {e}");
                throw;
            }

            Application.quitting += OnApplicationQuit; // register quit event handler to cleanup the nasty stuff whenever the game is closed. 
            
            // All done!
            Logger.LogInfo($"Plugin {PluginInfo.PLUGIN_NAME} is loaded!");
        }

        // Unpatch if plugin is destroyed to handle in-game plugin reloads
        // Remove files we created
        public void OnApplicationQuit() {
            Logger.LogInfo("Cleaning up...");
            CleanUp();
        }

        // Adds content of embedded html to the original gateway
        // Save result in custom gateway that we'll force the game to use
        private void ReplaceFiles() {
            var lines = File.ReadAllLines(_loadingViewsFileAbs);
            
            if (File.Exists(_loadingViewsBackupFileAbs)) { File.Delete(_loadingViewsBackupFileAbs); } // remove the backup if it exists, we're making a new one
            File.Copy(_loadingViewsFileAbs, _loadingViewsBackupFileAbs); // making a new backup
            if (File.Exists(_gatewayBackupFileAbs)) { File.Delete(_gatewayBackupFileAbs); }
            File.Copy(_gatewayFileAbs, _gatewayBackupFileAbs);
            if (File.Exists(_profileViewsBackupFileAbs)) { File.Delete(_profileViewsBackupFileAbs); }
            File.Copy(_profileViewsFileAbs, _profileViewsBackupFileAbs);
            if (File.Exists(_drachbotFileAbs))
            {
                File.Copy(Path.Combine(Environment.CurrentDirectory, @"Data\drachbot-views.js"), _drachbotFileAbs);
            }

            Logger.LogInfo("Drachbot Overlay: Success");
        }

        // Delete custom gateway file
        private void CleanUp()
        {
            if (File.Exists(_loadingViewsBackupFileAbs))
            {
                File.Delete(_loadingViewsFileAbs); // delete the modified version
                File.Move(_loadingViewsBackupFileAbs, _loadingViewsFileAbs); // put the original back
            }

            if (File.Exists(_gatewayBackupFileAbs))
            {
                File.Delete(_gatewayFileAbs); // delete the modified version
                File.Move(_gatewayBackupFileAbs, _gatewayFileAbs); // put the original back
            }
            if (File.Exists(_profileViewsFileAbs))
            {
                File.Delete(_profileViewsFileAbs); // delete the modified version
                File.Move(_profileViewsBackupFileAbs, _profileViewsFileAbs); // put the original back
            }
        }
    }
}
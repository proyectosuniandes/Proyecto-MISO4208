#!/bin/sh +x
# shellcheck disable=SC2039

export DEVICE=$1
echo $DEVICE
export APK_PATH="./apks/"$2
echo $APK_PATH
export COLORS='yes'
echo $COLORS
export ANDROID_HOME=/home/hanner/Android/Sdk/

source ./genymotion/control_genymotion.sh


# stop all devices
stop_all_genymotion

# clean test results
rm -rf calabash_report.json
rm -rf rerun.txt
# clean up Calabash test servers
rm -rf test_servers

# start up / wait for Genymotion simulator
get_genymotions_running "$DEVICE" || echo "Device was not found"

# determine ADB serial number
echo Using device name: $DEVICE
SERIAL="$(get_adb_serial_from_name "$DEVICE")"
# hack for 4.1.1 devices
if [ -z "$SERIAL" ]
  then
    SERIAL="$(get_adb_serial_from_name ":")"
fi
echo ADB serial of device: $SERIAL

# uninstall previous apk package
./genymotion/tools/adb -s $SERIAL uninstall es.usc.citius.servando.calendula
./genymotion/tools/adb -s $SERIAL uninstall org.isoron.uhabits

# unlock screen for 5.0.0
./genymotion/tools/adb -s $SERIAL shell input keyevent 82

# run tests
calabash-android resign $APK_PATH
ADB_DEVICE_ARG="$SERIAL"
calabash-android run "$APK_PATH" --format json --out calabash_report.json --format rerun --out rerun.txt
PID=`ps -fea | grep -i "player" | awk '{print $2}'`
kill $PID


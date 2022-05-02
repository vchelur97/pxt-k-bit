//% deprecated
namespace k_Bit {

}

namespace modules {
    /**
     * KeyStudio ultrasonic sensor
     */
    //% fixedInstance whenUsed block="keystudio ultrasonic sensor"
    export const keyStudioUltra = new DistanceClient("keystudio ultra?dev=self&variant=Ultrasonic")

    /**
     * Left motor obstacle sensor
     */
    //% fixedInstance whenUsed block="keystudio obstacle left"
    export const keyStudioObstacleLeft = new ReflectedLightClient("keystudio obstacle left?dev=self&variant=InfraredDigital&srvo=0")

    /**
     * Left motor obstacle sensor
     */
    //% fixedInstance whenUsed block="keystudio obstacle right"
    export const keyStudioObstacleRight = new ReflectedLightClient("keystudio obstacle right?dev=self&variant=InfraredDigital&srvo=1")

    /**
     * Left motor obstacle sensor
     */
    //% fixedInstance whenUsed block="keystudio line left"
    export const keyStudioLineLeft = new ReflectedLightClient("keystudio line left?dev=self&variant=InfraredDigital&srvo=2")

    /**
     * Left motor obstacle sensor
     */
    //% fixedInstance whenUsed block="keystudio line right"
    export const keyStudioLineRight = new ReflectedLightClient("keystudio line right?dev=self&variant=InfraredDigital&srvo=3")

    /**
     * KeyStudio light resitor sensor
     */
    //% fixedInstance whenUsed block="keystudio light level"
    export const keyStudioLightLevel = new LightLevelClient("keystudio light level?dev=self&variant=PhotoResistor")

    /**
     * Keystudio Front LEDs
     */
    //% fixedInstance whenUsed block="keystudio front leds"
    export const keyStudioFrontLEDs = new LedClient("keystudio front leds?dev=self&variant=Stick&srvo=2&num_pixels=1&leds_per_pixel=2&srvo=0")

    /**
    * Keystudio LED Ring
     */
    //% fixedInstance whenUsed block="keystudio ring leds"
    export const keyStudioRingLEDs = new LedClient("keystudio ring leds?dev=self&variant=Ring&srvo=2&num_pixels=18&srvo=1")
}

namespace servers {
    function start() {
        jacdac.productIdentifier = 0x355e28c5
        jacdac.deviceDescription = "KeyStudio Mini Smart Robot Car"
        jacdac.startSelfServers(() => {
            // also init i2c
            k_Bit.OFFLed()
            const servers = [
                jacdac.createSimpleSensorServer(jacdac.SRV_DISTANCE, jacdac.DistanceRegPack.Distance, () => k_Bit.ultra() / 100.0, { instanceName: "ultra", variant: jacdac.DistanceVariant.Ultrasonic }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness, () => k_Bit.obstacle(MotorObs.LeftSide), { instanceName: "OL", variant: jacdac.ReflectedLightVariant.InfraredDigital }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness, () => k_Bit.obstacle(MotorObs.RightSide), { instanceName: "OR", variant: jacdac.ReflectedLightVariant.InfraredDigital }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness, () => (k_Bit.LineTracking() & 0x01) ? 1 : 0, {
                    instanceName: "LL",
                    variant: jacdac.ReflectedLightVariant.InfraredDigital
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness, () => (k_Bit.LineTracking() & 0x10) ? 1 : 0, {
                    instanceName: "LR",
                    variant: jacdac.ReflectedLightVariant.InfraredDigital
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_LIGHT_LEVEL, jacdac.LightLevelRegPack.LightLevel, () => Math.map(k_Bit.PH(), 0, 1024, 0, 1), { variant: jacdac.LightLevelVariant.PhotoResistor }),
                new jacdac.LedServer(1, jacdac.LedPixelLayout.RgbRgb, (p, b) => {
                    k_Bit.LED_brightness(b)
                    k_Bit.SetLed(p[0], p[1], p[2])
                }, {
                    variant: jacdac.LedVariant.Stick,
                    ledsPerPixel: 2
                }),
                new jacdac.LedServer(18, jacdac.LedPixelLayout.RgbGrb, (p, b) => light.sendWS2812BufferWithBrightness(p, DigitalPin.P5, b), {
                    variant: jacdac.LedVariant.Ring
                }),
            ]
            return servers
        })
    }
    start()
}
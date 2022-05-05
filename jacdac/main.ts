//% deprecated
namespace k_Bit {

}
//% deprecated
namespace neopixel {

}
//% deprecated
namespace irRemote {

}

namespace modules {
    /**
     * Left motor control
     */
    //% fixedInstance whenUsed block="keystudio motor left"
    export const keyStudioMotorLeft = new MotorClient("keystudio motor left?dev=self&srvo=0")
    /**
     * Right motor control
     */
    //% fixedInstance whenUsed block="keystudio motor right"
    export const keyStudioMotorRight = new MotorClient("keystudio motor right?dev=self&srvo=1")
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
    export const keyStudioFrontLEDs = new LedClient("keystudio front leds?dev=self&variant=Stick&num_pixels=1&leds_per_pixel=2&srvo=0")

    /**
    * Keystudio LED Ring
     */
    //% fixedInstance whenUsed block="keystudio ring leds"
    export const keyStudioRingLEDs = new LedClient("keystudio ring leds?dev=self&variant=Ring&num_pixels=18&srvo=1")
}

namespace servers {
    function sync(server: jacdac.ActuatorServer, motor: MotorObs) {
        const enabled = !!server.intensity
        if (!enabled) {
            k_Bit.carStop()
        } else {
            const speed = server.value
            k_Bit.Motor(motor,
                speed < 0 ? MotorDir.Back : MotorDir.Forward,
                Math.abs(speed) * 100)
        }
    }

    function start() {
        jacdac.productIdentifier = 0x355e28c5
        jacdac.deviceDescription = "KeyStudio Mini Smart Robot Car"
        jacdac.startSelfServers(() => {
            const servers: jacdac.Server[] = [
                jacdac.createActuatorServer(
                    jacdac.SRV_MOTOR,
                    jacdac.MotorRegPack.Speed,
                    jacdac.MotorRegPack.Enabled,
                    (server) => sync(server, MotorObs.LeftSide), {
                    instanceName: "ML",
                    statusCode: jacdac.SystemStatusCodes.Initializing,
                }),
                jacdac.createActuatorServer(
                    jacdac.SRV_MOTOR,
                    jacdac.MotorRegPack.Speed,
                    jacdac.MotorRegPack.Enabled,
                    (server) => sync(server, MotorObs.RightSide), {
                    instanceName: "MR",
                    statusCode: jacdac.SystemStatusCodes.Initializing,
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_DISTANCE, jacdac.DistanceRegPack.Distance,
                    () => k_Bit.ultra() / 100.0, {
                    instanceName: "ultra",
                    variant: jacdac.DistanceVariant.Ultrasonic,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness,
                    () => k_Bit.obstacle(MotorObs.LeftSide) ? 0 : 0.99, {
                    instanceName: "OL",
                    variant: jacdac.ReflectedLightVariant.InfraredDigital,
                    streamingInterval: 100,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness,
                    () => k_Bit.obstacle(MotorObs.RightSide) ? 0 : 0.99, {
                    instanceName: "OR",
                    variant: jacdac.ReflectedLightVariant.InfraredDigital,
                    streamingInterval: 100,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness,
                    () => (k_Bit.LineTracking() & 1) ? 0.99 : 0, {
                    instanceName: "LL",
                    variant: jacdac.ReflectedLightVariant.InfraredDigital,
                    streamingInterval: 100,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_REFLECTED_LIGHT, jacdac.ReflectedLightRegPack.Brightness,
                    () => (k_Bit.LineTracking() & 2) ? 0.99 : 0, {
                    instanceName: "LR",
                    variant: jacdac.ReflectedLightVariant.InfraredDigital,
                    streamingInterval: 100,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
                jacdac.createSimpleSensorServer(jacdac.SRV_LIGHT_LEVEL, jacdac.LightLevelRegPack.LightLevel,
                    () => Math.map(k_Bit.PH(), 0, 1024, 0, 0.99), {
                    variant: jacdac.LightLevelVariant.PhotoResistor,
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
                new jacdac.LedServer(1, jacdac.LedPixelLayout.RgbRgb, (p, b) => {
                    k_Bit.LED_brightness(b)
                    k_Bit.SetLed(p[0], p[1], p[2])
                }, {
                    variant: jacdac.LedVariant.Stick,
                    ledsPerPixel: 2,
                    instanceName: "front leds",
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
                new jacdac.LedServer(18, jacdac.LedPixelLayout.RgbGrb, (p, b) => light.sendWS2812BufferWithBrightness(p, DigitalPin.P5, b), {
                    variant: jacdac.LedVariant.Ring,
                    instanceName: "top leds",
                    statusCode: jacdac.SystemStatusCodes.Initializing
                }),
            ]

            control.runInBackground(() => {
                // also init i2c
                k_Bit.OFFLed()
                k_Bit.PH()
                k_Bit.carStop()
                k_Bit.ultra()
                for (const server of servers)
                    server.setStatusCode(jacdac.SystemStatusCodes.Ready)
            })

            return servers
        })
    }
    start()
}
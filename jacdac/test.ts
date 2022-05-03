let k = 0
const colors = [
    0x0f0000,
    0x0f0f00,
    0x000f00,
    0x000f0f,
    0x00000f,
]

forever(() => {
    modules.keyStudioRingLEDs.setPixelColor(k % modules.keyStudioRingLEDs.numPixels(), colors[Math.idiv(k, modules.keyStudioRingLEDs.numPixels()) % colors.length])
    pause(100)
})
forever(() => {
    modules.keyStudioFrontLEDs.setBrightness(0.99)
    if (modules.keyStudioObstacleLeft.brightness() > 0)
        led.plot(0, 0)
    else
        led.unplot(0, 0)
    if (modules.keyStudioObstacleRight.brightness() > 0)
        led.plot(4, 0)
    else led.unplot(4, 0)

    if (modules.keyStudioUltra.distance() < 0.1) {
        modules.keyStudioFrontLEDs.setAll(0xff0000)
        modules.keyStudioMotorLeft.run(0)
        modules.keyStudioMotorRight.run(0)
    }
    else {
        modules.keyStudioFrontLEDs.setAll(0x0000ff)
        if (modules.keyStudioLineLeft.brightness() > 0) {
            led.plot(1, 1)
            modules.keyStudioMotorLeft.run(99)
        }
        else {
            led.unplot(1, 1)
            modules.keyStudioMotorLeft.run(25)
        }
        if (modules.keyStudioLineRight.brightness() > 0) {
            led.plot(3, 1)
            modules.keyStudioMotorRight.run(99)
        }
        else {
            led.unplot(3, 1)
            modules.keyStudioMotorRight.run(25)
        }
    }

    pause(20)
    k++
})
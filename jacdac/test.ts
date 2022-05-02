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
    if (modules.keyStudioObstacleLeft.brightness() > 0 || modules.keyStudioObstacleRight.brightness() > 0)
        modules.keyStudioFrontLEDs.setAll(0x0f0000)
    else
        modules.keyStudioFrontLEDs.setAll(0x00000f)
    if (modules.keyStudioObstacleLeft.brightness() > 0)
        led.plot(0, 0)
    else
        led.unplot(0, 0)
    if (modules.keyStudioObstacleRight.brightness() > 0)
        led.plot(4, 0)
    else led.unplot(4, 0)
    if (modules.keyStudioLineLeft.brightness() > 0) {
        led.plot(1, 1)
        modules.keyStudioMotorLeft.run(99)
    }
    else { 
        led.unplot(1, 1)
        modules.keyStudioMotorLeft.run(50)
    }
    if (modules.keyStudioLineRight.brightness() > 0) {
        led.plot(3, 1)
        modules.keyStudioMotorRight.run(99)
    }
    else {
        led.unplot(3, 1)
        modules.keyStudioMotorRight.run(50)
    }

    k++
})
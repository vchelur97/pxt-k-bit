// keyestudio k-bit car for microbit
// author: jieliang mo
// github:https://github.com/mworkfun
// Write the date: 2020-6-19

/**
 * use for RGB-LED
 */
enum COLOR {
    red,
    green,
    blue,
    white,
    black
}
/**
 * use for control motor
 */
enum DIR {
    RunForward = 0,
    RunBack = 1,
    TurnLeft = 2,
    TurnRight = 3
}
/**
 * use for motor and infrared obstacle sensor
 */
enum MotorObs {
    LeftSide = 0,
    RightSide = 1
}
enum MotorDir {
    Forward = 0,
    Back = 1
}
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Motor', 'RGB-led', 'Neo-pixel', 'Sensor', 'Tone']"
namespace k_Bit {
    /**
     * use for control PCA9685
     */
    const PCA9685_ADDRESS = 0x43;   //device address
    const MODE1 = 0x00;
    const MODE2 = 0x01;
    const SUBADR1 = 0x02;
    const SUBADR2 = 0x03;
    const SUBADR3 = 0x04;
    const PRESCALE = 0xFE;
    const LED0_ON_L = 0x06;
    const LED0_ON_H = 0x07;
    const LED0_OFF_L = 0x08;
    const LED0_OFF_H = 0x09;
    const ALL_LED_ON_L = 0xFA;
    const ALL_LED_ON_H = 0xFB;
    const ALL_LED_OFF_L = 0xFC;
    const ALL_LED_OFF_H = 0xFD;

    let PCA9685_Initialized = false

    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function i2cWrite(PCA9685_ADDRESS: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf)
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cRead(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cWrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

    function init_PCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE1, 0x00);  //initialize the mode register 1
        setFreq(50);   //20ms
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        PCA9685_Initialized = true;
    }

    /////////////////////////////////////////////////////
    /**
     * car run diretion
     */
    //% block="car $direction speed: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=99
    export function run(direction: DIR, speed: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }
        let speed_value = Math.map(speed, 0, 100, 0, 4095);
        switch (direction) {
            case 0:  //run forward
                setPwm(1, 0, speed_value);  //control speed : 0---4095
                setPwm(0, 0, 0);
                setPwm(3, 0, speed_value);  //control speed : 0---4095
                setPwm(2, 0, 0);
                break;
            case 1:  //run back
                setPwm(1, 0, speed_value);  //control speed : 0---4095
                setPwm(0, 0, 4095);
                setPwm(3, 0, speed_value);  //control speed : 0---4095
                setPwm(2, 0, 4095);
                break;
            case 2:  //turn left
                setPwm(1, 0, speed_value);  //control speed : 0---4095
                setPwm(0, 0, 4095);
                setPwm(3, 0, speed_value);  //control speed : 0---4095
                setPwm(2, 0, 500);
                break;
            case 3:  //turn right
                setPwm(1, 0, speed_value);  //control speed : 0---4095
                setPwm(0, 0, 500);
                setPwm(3, 0, speed_value);  //control speed : 0---4095
                setPwm(2, 0, 4095);
                break;
            default: break;
        }
    }
    /**
     * set cat state
     */
    //% block="car stop"
    //% group="Motor" weight=98
    export function carStop() {
        if (!PCA9685_Initialized) {
        init_PCA9685();
        }
        setPwm(1, 0, 0);  //control speed : 0---4095
        setPwm(3, 0, 0);  //control speed : 0---4095
    }
    /**
     * set speed of motor
     */
    //% block="$M motor run $MD speed: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function Motor(M: MotorObs, MD: MotorDir, speed: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }
        let speed_value = Math.map(speed, 0, 100, 0, 4095);
        if (M == 0 && MD == 0) {
            setPwm(3, 0, speed_value);  //control speed : 0---4095
            setPwm(2, 0, 0);
        }
        if (M == 0 && MD == 1) {
            setPwm(3, 0, speed_value);  //control speed : 0---4095
            setPwm(2, 0, 4095);
        }

        if (M == 1 && MD == 0) {
            setPwm(1, 0, speed_value);  //control speed : 0---4095
            setPwm(0, 0, 0);
        }
        if (M == 1 && MD == 1) {
            setPwm(1, 0, speed_value);  //control speed : 0---4095
            setPwm(0, 0, 4095);
        }

    }
    /**
     * set motor state
     */
    //% block="$M motor stop"
    //% group="Motor" weight=96
    export function MotorSta(M: MotorObs) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }

        if (M == 0) {         //left side motor
            setPwm(1, 0, 0);  //control speed : 0---4095
            setPwm(0, 0, 0);
        }
        if (M == 1) {         //right side motor
            setPwm(3, 0, 0);  //control speed : 0---4095
            setPwm(2, 0, 0);
        }
    }
    /////////////////////////////////////////////////////
    /**
     * set rgb-led brightness
     */
    let L_brightness = 4095;  //control the rgb-led brightness
    //% block="LED brightness $br"
    //% br.min=0 br.max=255
    //% group="RGB-led" weight=79
    export function LED_brightness(br: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }
        L_brightness = Math.map(br, 0, 255, 4095, 0);
    }
    /**
     * set the rgb-led color via the color card
     */
    //% block="set RGBled $col"
    //% group="RGB-led" weight=78
    export function Led(col: COLOR) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }

        if (col == COLOR.red) {
            setPwm(5, 0, 4095);
            setPwm(6, 0, L_brightness);
            setPwm(4, 0, 4095);
            }
        if (col == COLOR.green) {
            setPwm(5, 0, L_brightness);
            setPwm(6, 0, 4095);
            setPwm(4, 0, 4095);
            }
        if (col == COLOR.blue) {
            setPwm(5, 0, 4095);
            setPwm(6, 0, 4095);
            setPwm(4, 0, L_brightness);
            }
        if (col == COLOR.white) {
            setPwm(5, 0, L_brightness);
            setPwm(6, 0, L_brightness);
            setPwm(4, 0, L_brightness);
        }
        if (col == COLOR.black) {
            setPwm(5, 0, 4095);
            setPwm(6, 0, 4095);
            setPwm(4, 0, 4095);
        }
    }
    /**
     * set the rgb-led color via data
     */
    //% block=" set RGBled R:$red G:$green B:$blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% group="RGB-led" weight=77
    export function SetLed(red: number, green: number, blue: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }

        let R = Math.map(red, 0, 255, 4095, L_brightness);
        let G = Math.map(green, 0, 255, 4095, L_brightness);
        let B = Math.map(blue, 0, 255, 4095, L_brightness);

        setPwm(6, 0, R);
        setPwm(5, 0, G);
        setPwm(4, 0, B);
    }
    /**
     * turn off all rgb-led
     */
    //% block="turn off RGB-led"
    //% group="RGB-led" weight=76
    export function OFFLed() {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }

        setPwm(6, 0, 4095);
        setPwm(5, 0, 4095);
        setPwm(4, 0, 4095);
    }

    /////////////////////////////////////////////////////
    /**
     * infrared obstacle sensor
     */
    pins.setPull(DigitalPin.P2, PinPullMode.PullNone);
    pins.setPull(DigitalPin.P11, PinPullMode.PullNone);
    //% block="$LR obstacle sensor "
    //% group="Sensor" weight=69
    export function obstacle(LR: MotorObs): number {
        let val;
        if(LR == 0){  //left side
            val = pins.digitalReadPin(DigitalPin.P2);
        }
        if(LR == 1){  //right side
            val = pins.digitalReadPin(DigitalPin.P11);
        }
        return val;
    }
    /**
     * return 0b01 or 0b10
     * 0b01 is the sensor on the left
     * 0b10 is the sensor on the right
     */
    pins.setPull(DigitalPin.P12, PinPullMode.PullNone);
    pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
    //% block="Line Tracking"
    //% group="Sensor" weight=68
    export function LineTracking(): number {
        let val = pins.digitalReadPin(DigitalPin.P12) << 0 | pins.digitalReadPin(DigitalPin.P13) << 1;
        return val;
    }
    /**
     * Ultrasonic sensor
     */
    const TRIG_PIN = DigitalPin.P14;
    const ECHO_PIN = DigitalPin.P15;
    pins.setPull(TRIG_PIN, PinPullMode.PullNone);
    let lastTime = 0;
    //% block="Ultrasonic"
    //% group="Sensor" weight=67
    export function ultra(): number {
        //send trig pulse
        pins.digitalWritePin(TRIG_PIN, 0)
        control.waitMicros(2);
        pins.digitalWritePin(TRIG_PIN, 1)
        control.waitMicros(10);
        pins.digitalWritePin(TRIG_PIN, 0)

        // read echo pulse  max distance : 6m(35000us)  
        let t = pins.pulseIn(ECHO_PIN, PulseValue.High, 35000);
        let ret = t;

        //Eliminate the occasional bad data
        if (ret == 0 && lastTime != 0) {
            ret = lastTime;
        }
        lastTime = t;

        return Math.round(ret / 58);
    }
    /**
     * photoresistance sensor
     */
    //% block="photoresistor "
    //% group="Sensor" weight=66
    export function PH(): number {
        return pins.analogReadPin(AnalogPin.P1);  
    }
}
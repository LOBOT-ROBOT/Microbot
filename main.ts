/*
 microbot package
*/
 //% weight=10 icon="\uf013" color=#2896ff
 namespace microbot {
    export enum Servos {
		S1 = 0x01,
		S2 = 0x02,
		S3 = 0x03,
		S4 = 0x04,
		S5 = 0x05,
		S6 = 0x06,
		S7 = 0x07,
        S8 = 0x08

	}
	
    export enum Colors {
        //% blockId="Red" block="Red"
        Red = 0x01,
        //% blockId="Green" block="Green"
        Green = 0x02,
        //% blockId="Blue" block="Blue"
		Blue = 0x03
    }

    export enum Lights {
        //% block="Light 1"
        Light1 = 0x00,
        //% block="Light 2"
        Light2 = 0x01,
        //% block="Light 3"
        Light3 = 0x02,
        //% block="Light 4"
        Light4 = 0x03,
        //% block="Light 5"
        Light5 = 0x04,
        //% block="Light 6"
        Light6 = 0x05,
        //% block="All"
        All = 0x06
    }

    export enum LineFollower {
        //% blockId="S1_OUT_S2_OUT" block="Sensor1 and sensor2 are out black line"
        S1_OUT_S2_OUT = 0x00,
        //% blockId="S1_OUT_S2_IN" block="Sensor2 in black line but sensor1 not"
        S1_OUT_S2_IN = 0x01,
        //% blockId="S1_IN_S2_OUT" block="Sensor1 in black line but sensor2 not"
        S1_IN_S2_OUT = 0x02,
        //% blockId="S1_IN_S2_IN" block="Sensor1 and sensor2 are in black line "
        S1_IN_S2_IN = 0x03
     }
     
     export enum IRKEY {
        //% block="CH-"
        CH_MINUS=162,
        //% block="CH"
        CH=98,
        //% block="CH+"
        CH_ADD=226,
        //% block="PREV"
        PREV=34,
        //% block="NEXT"
        NEXT=2,
        //% block="PLAY/PAUSE"
        PLAY_PAUSE=194,
        //% block="+"
        ADD=168,
        //% block="-"
        MINUS=224,
        //% block="EQ"
        EQ=144,
        //% block="100+"
        _100=152,
        //% block="200+"
        _200=176,
        //% block="R0"
        R0=104,
        //% block="R1"
        R1=48,
        //% block="R2"
        R2=24,
        //% block="R3"
        R3=122,
        //% block="R4"
        R4=16,
        //% block="R5"
        R5=56,
        //% block="R6"
        R6=90,
        //% block="R7"
        R7=66,
        //% block="R8"     
        R8=74,
        //% block="R9"
        R9=82
    }

    export enum CmdType {
        //% block="Invalid command"
        NO_COMMAND = 0,
        //% block="car run"
        CAR_RUN = 1,
        //% block="Servo"
        SERVO = 2,
        //% block="Ultrasonic distance"
        ULTRASONIC = 3,
        //% block="Temperature"
        TEMPERATURE = 4,
        //% block="Sound"
        SOUND = 5,
        //% block="Light"
        LIGHT = 6,
        //% block="Rgb light"
        RGB_LIGHT = 8,
        //% block="Honk horn"
        DIDI = 9,
        //% block="Read firmware version"
        VERSION = 10
    }

    export enum CarRunCmdType {
        //% block="Stop"
        STOP = 0,
        //% block="Go ahead"
        GO_AHEAD,
        //% block="Back"
        GO_BACK,
        //% block="Turn left"
        TURN_LEFT,
        //% block="Turn right"
        TURN_RIGHT,
        //% block="Go ahead slowly"
        GO_AHEAD_SLOW,
        //% block="Turn left slowly"
        TURN_LEFT_SLOW,
        //% block="Turn right slowly"
        TURN_RIGHT_SLOW,
        //% block="Invalid command"
        COMMAND_ERRO
    }


    let lhRGBLight: RGBLight.LHRGBLight;
	let R_F: number;
	let r_f: number;
	
	let g_f: number;
	let G_F: number;

	let b_f: number;
    let B_F: number;
    
     let handleCmd: string = "";
     
     let distance: number = 0;
     
     let MESSAGE_HEAD: number = 0xff;

     let MESSAGE_HEAD_LONG: number = 0x100;
     let MESSAGE_HEAD_STOP: number = 0x101;

     let cntIr = 0;
     let adress = 0;
     let sendFlag = false;

  /**
   * Microbot board initialization, please execute at boot time
  */
  //% weight=100 blockId=microbotInit block="Initialize Microbot"
  export function microbotInit() {
      initRGBLight();   
     // initColorSensor();
      serial.redirect(
        SerialPin.P12,
        SerialPin.P8,
        BaudRate.BaudRate115200);
	    basic.forever(() => {
      		getHandleCmd();
  	    });	  
     }

     
  /**
  * Get the handle command.
  */
  
     function getHandleCmd() {
        let charStr: string = serial.readString();
        handleCmd = handleCmd.concat(charStr);
        let cnt: number = countChar(handleCmd, "$");
        if (cnt == 0)
            return;
        let index = findIndexof(handleCmd, "$", 0);
         if (index != -1) {
             let cmd: string = handleCmd.substr(0, index);
             if (cmd.charAt(0).compare("A") == 0 && cmd.length == 5) {
                 let arg1Int: number = strToNumber(cmd.substr(1, 2));
                 let arg2Int: number = strToNumber(cmd.substr(3, 2));

                 if (arg1Int != -1)
                 {
                     distance = arg1Int;     
                 }

                 if (arg2Int != -1) {
                    if (arg2Int == 0) {
                        if (adress != 0) {
                            control.raiseEvent(MESSAGE_HEAD_STOP, 0);
                        }
                        sendFlag = false;
                        adress = 0;
                    }
                    else {
                        if (adress != arg2Int) {
                            if (!sendFlag) {
                                control.raiseEvent(MESSAGE_HEAD, arg2Int);
                                sendFlag = true;
                            }
                            adress = arg2Int
                        }
                        else {
                            cntIr++;
                        }
                        if (cntIr >= 3) {
                            cntIr = 0;
                            control.raiseEvent(MESSAGE_HEAD_LONG, arg2Int);
                        }
                    }
                }
             }
         }
         handleCmd = "";
     }
     

  function countChar(src: string, strFind: string): number {
    let cnt: number = 0;
    for (let i = 0; i < src.length; i++)
    {
        if (src.charAt(i).compare(strFind) == 0)
        {
            cnt++;
        }
    }
    return cnt;
}   

function findIndexof(src: string,strFind: string,startIndex: number): number
{
    for (let i = startIndex; i < src.length; i++)
    {
        if (src.charAt(i).compare(strFind) == 0)
        {
            return i;
        }    
    }  
    return -1;
}
     
     
function strToNumber(str: string): number {
    let num: number = 0;
    for (let i = 0; i < str.length; i++)
    {
        let tmp: number = converOneChar(str.charAt(i));
        if (tmp == -1)
            return -1;    
        if (i > 0)
            num *= 16;    
        num += tmp;
    }    
    return num;
    }
     
     function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;  
        }
        else
            return -1; 
    }

/**
* Set the angle of servo 1 to 8, range of 0~180 degree
*/
//% weight=98 blockId=setServo block="Set servo|index %index|angle %angle|duration %duration"
//% angle.min=0 angle.max=180
    export function setServo(index: number, angle: number, duration: number) {
        if (angle > 180 || angle < 0)
        {
            return; 
        }    
        let position = mapRGB(angle, 0, 180, 500, 2500);
       
	   let buf = pins.createBuffer(10);
	   buf[0] = 0x55;
	   buf[1] = 0x55;
	   buf[2] = 0x08;
	   buf[3] = 0x03;//cmd type
	   buf[4] = 0x01;
	   buf[5] = duration & 0xff;
	   buf[6] = (duration >> 8) & 0xff;
	   buf[7] = index;
	   buf[8] = position & 0xff;
	   buf[9] = (position >> 8) & 0xff;
	   serial.writeBuffer(buf);
}


/**
*	Set the speed of the number 1 motor and number 2 motor, range of -100~100, that can control the tank to go advance or turn of.
*/
//% weight=96 blockGap=50 blockId=setMotor block="Set motor1 speed|%speed1|and motor2|speed %speed2"
//% speed1.min=-100 speed1.max=100
//% speed2.min=-100 speed2.max=100
    export function setMotorSpeed(speed1: number, speed2: number) {
        if (speed1 > 100 || speed1 < -100 || speed2 > 100 || speed2 < -100) {
            return;
        } 

   speed1 = speed1 * -1;
   speed2 = speed2 * -1;    
   let buf = pins.createBuffer(6);
   buf[0] = 0x55;
   buf[1] = 0x55;
   buf[2] = 0x04;
   buf[3] = 0x32;//cmd type
   buf[4] = speed1;
   buf[5] = speed2;
   serial.writeBuffer(buf);
}
    
    /**
     * Do someting when Qdee receive remote-control code
     * @param code the ir key button that needs to be pressed
     * @param body code to run when event is raised
     */
    //% weight=95 blockId=onQdee_remote_ir_pressed block="on remote-control|%code|pressed"
    export function onQdee_remote_ir_pressed(code: IRKEY,body: Action) {
        control.onEvent(MESSAGE_HEAD,code,body);
     }
     

    /**
     * Do someting when remote-control longpress
     * @param code the ir key button that needs to be pressed
     * @param body code to run when event is raised
     */
    //% weight=94 blockId=onQdee_remote_ir_longpressed block="on remote-control|%code|long pressed"
    export function onQdee_remote_ir_longpressed(code: IRKEY, body: Action) {
        control.onEvent(MESSAGE_HEAD_LONG, code, body);
    }

    /**
     * Do someting when remote-control stop send
     * @param code the ir key button that needs to be pressed
     * @param body code to run when event is raised
     */
    //% weight=93 blockId=onQdee_remote_no_ir block="on remote-control stop send"
    export function onQdee_remote_no_ir(body: Action) {
        control.onEvent(MESSAGE_HEAD_STOP, 0, body);
    }
     
/**
*  Obtain the distance of ultrasonic detection to the obstacle
*/
//% weight=92 blockId=Ultrasonic block="Ultrasonic distance(cm)"
   export function Ultrasonic(): number {
	   //init pins
    return distance;
}
   
	
    /**
     * Obtain the condition of the tracking sensor
     */
    //% weight=90 blockGap=50  blockId=readLineStatus block="Line follower status |%status|"
    export function readLineFollowerStatus(status: LineFollower): boolean {
        let s1 = pins.digitalReadPin(DigitalPin.P14);
        let s2 = pins.digitalReadPin(DigitalPin.P13);
        let s = ((1 & s1) << 1) | s2;
        if (s == status)
        {
            return true;
        }    
        else
        {
            return false;
        }     
     }


    /**
	 * Initialize RGB
	 */
	function initRGBLight() {
		if (!lhRGBLight) {
			lhRGBLight = RGBLight.create(DigitalPin.P15, 6, RGBPixelMode.RGB);
		}
    }
    
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=86 blockId=setPixelRGB block="Set|%lightoffset|color to %rgb"
    export function setPixelRGB(lightoffset: Lights, rgb: RGBColors)
    {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }
    /**
     * Set RGB Color argument
     */
    //% weight=85 blockId=setPixelRGBArgs block="Set|%lightoffset|color to %rgb"
    export function setPixelRGBArgs(lightoffset: Lights, rgb: number)
    {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=84 blockId=showLight block="Show light"
    export function showLight() {
        lhRGBLight.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=82 blockGap=50 blockId=clearLight block="Clear light"
    export function clearLight() {
        lhRGBLight.clear();
    }


	

	function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
		return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    
    /**
     * Resolve the Bluetooth that phone APP send command type, the total of nine types of commands: tank display command, servo debug command, obtaining the distance of ultrasonic command, obtaining temperature command, obtain sound size rank orders, to obtain the light level command, set the color lights command, honking command, firmware version information command.
     */
    //% weight=72 blockId=analyzeBluetoothCmd block="Get bluetooth command type %str"
    export function analyzeBluetoothCmd(str: string): number {
        if (str.length > 9)
        {
            let cmdHead = str.substr(0, 3);
            
            if (cmdHead == "CMD")
            {
                let cmdTypeStr: string = str.substr(4, 2);
                if (!checkArgsInt(cmdTypeStr))
                {
                    return CmdType.NO_COMMAND;
                }    
                let cmdType = parseInt(cmdTypeStr);

                if (cmdType > CmdType.VERSION || cmdType < 0)
                {
                    return CmdType.NO_COMMAND; 
                } 
                else
                {
                    return cmdType;
                }    
            }
            else
            {
                return CmdType.NO_COMMAND; 
            }    
        }   
        else
        {
            return CmdType.NO_COMMAND;
        }    
    }

    function checkArgsInt(str: string): boolean {
        let i = 0;
        for (; i < str.length; i++)
        {
            if (str.charAt(i) < '0' || str.charAt(i) > '9')
            {
                return false;
            }    
        }
        return true;
    }

    /**
     * Resolve the parameters that the phone APP send the command,there are 3 parameters of servo debug command,the other command has just one parameter.
     */
    //% weight=70  blockId=getArgs block="Get bluetooth command|%str|argument at %index"
    //% index.min=1 index.max=3
    export function getArgs(str: string,index: number): number {
        let cmdType = analyzeBluetoothCmd(str);
        if (cmdType == CmdType.NO_COMMAND)
        {
            return CarRunCmdType.COMMAND_ERRO;
        }
        else {
            let dataIndex = 7;
            let subLegth = 2;
            if (index == 2)
            {
                dataIndex = 10;
                subLegth = 4;
            }
            else if (index == 3)
            {
                dataIndex = 15;
                subLegth = 4;
            } 
            if (cmdType == CmdType.SERVO)
            {
                if (str.length < 19)
                {
                    return CmdType.NO_COMMAND;
                }    
            }
            if ((index == 1 && str.length < 10)||(index == 2 && str.length < 15)||(index == 3 && str.length < 19))
            {
                return 0;
            }    
            let strArgs = str.substr(dataIndex, subLegth);
            if (!checkArgsInt(strArgs))
            {
                return 0;
            }    
            let arg = parseInt(strArgs);
            return arg;
        }
    }

    /**
     * Returns the enumeration of the command type, which can be compared with this module after obtaining the bluetooth command type sent by the mobile phone APP.
     */
    //% weight=68 blockId=getBluetoothCmdtype block="Bluetooth command type %type"
    export function getBluetoothCmdtype(type: CmdType): number {
        return type;
    }

    /**
     * The command type of the tank is stop, go ahead, back, turn left, turn right, slow down, turn left slowly, turn right slowly.
     */
    //% weight=66 blockId=getRunCarType block="Car run type %type"
    export function getRunCarTypeget(type: CarRunCmdType): number {
        return type;
    }

    /**
     * The distance from the ultrasonic obstacle is the standard command, which is sent to the mobile phone. The APP will indicate the distance of the ultrasonic obstacle.
     */
    //% weight=64 blockId=convertUltrasonic block="Convert ultrasonic distance %data"
    export function convertUltrasonic(data: number): string {
        let cmdStr: string = "CMD|03|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * The conversion temperature value is standard command, sent to the mobile phone, and the APP displays the current temperature.
     */
    //% weight=62 blockId=convertTemperature block="Convert temperature %data"
    export function convertTemperature(data: number): string {
        let cmdStr: string = "CMD|04|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
    }

    /**
     * Convert the light value is the standard command and send it to the mobile phone. The APP displays the current light level (0~255).
     */
    //% weight=60 blockId=convertLight block="Convert light %data"
    export function convertLight(data: number): string {
        let cmdStr: string = "CMD|06|";
        cmdStr += data.toString();
        cmdStr += "|$";
        return cmdStr;
     }
    
    /**
     *  The Melody of Little star   
     */
    //% weight=58 blockId=littleStarMelody block="Little star melody"
    export function littleStarMelody(): string[] {
        return ["C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4"];
    }
    
    
}

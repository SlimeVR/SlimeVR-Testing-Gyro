import { BitView } from "bit-buffer";
import { assert } from "console";

export const swapFn = <T extends string | number, S extends string | number>(
    obj: Record<T, S>
) => {
    const res = {} as any;
    Object.entries(obj).forEach(([key, value]) => {
        res[value as any] = key;
    });
    return res as { [k in S]: T };
};

export enum PacketType {
    Calibrate = 0x80,
    SetWorkMode = 0x82,
    WorkingCurrent = 0x83,
    HoldingCurrentParcent = 0x9b,
    Subdivision = 0x84,
    Enable = 0x85,
    Direction = 0x86,
    AutoTurnOffScreen = 0x87,
    Protect = 0x88,
    Mplyer = 0x89,
    SetCanRate = 0x8a,
    CanID = 0x8b,
    SlaveRespondActive = 0x8c,
    KeyLock = 0x8f,
    SetHome = 0x90,
    GoHome = 0x91,
    ZeroAxis = 0x92,
    SetMode0 = 0x9a,
    Reset = 0x3f,
    MotorStatus = 0xf1,
    Encoder = 0x30,
    MotorSpeed = 0x32,
    EncoderPulses = 0x33,
    IOPorts = 0x34,
    EncoderError = 0x39,
    EnPinStatus = 0x3a,
    GoToZeroStatus = 0x3b,
    ReleaseShaft = 0x3d,
    ReadShaftProtection = 0x3e,
    EnableMotor = 0xf3,
    EmergencyStop = 0xf7,
    SpeedMode = 0xf6,
    SaveSpeedMode = 0xff,
    RelativeMotion = 0xfd,
    AbsoluteMotion = 0xfe,
    RelativeMotionAxis = 0xf4,
    AbsoluteMotionAxis = 0xf5,
}

export interface BasePacket {
    id: PacketType;
}

type FrameStatus = "success" | "fail";
const frameStatusMap: Record<number, FrameStatus> = { 1: "success", 0: "fail" };

export interface Calibrate extends BasePacket {
    id: PacketType.Calibrate;
}
type CalibrationStatus = "calibarating" | "success" | "fail";
const calibrationStatusMap: Record<number, CalibrationStatus> = {
    0: "calibarating",
    1: "success",
    2: "fail",
};
const calibrationStatusMapFliped = swapFn(calibrationStatusMap);
export interface CalibrateResponse extends BasePacket {
    id: PacketType.Calibrate;
    status: CalibrationStatus;
}

type WorkMode =
    | "CR_OPEN"
    | "CR_CLOSE"
    | "CR_vFOC"
    | "SR_OPEN"
    | "SR_CLOSE"
    | "SR_vFOC";
const workModeMap: Record<number, WorkMode> = {
    0: "CR_OPEN",
    1: "CR_CLOSE",
    2: "CR_vFOC",
    3: "SR_OPEN",
    4: "SR_CLOSE",
    5: "SR_vFOC",
};
const workModeMapFliped = swapFn(workModeMap);
export interface SetWorkMode extends BasePacket {
    id: PacketType.SetWorkMode;
    mode: WorkMode;
}
export interface WorkModeResponse extends BasePacket {
    id: PacketType.SetWorkMode;
    status: FrameStatus;
}

export interface WorkingCurrent extends BasePacket {
    id: PacketType.WorkingCurrent;
    ma: number;
}
export interface WorkingCurrentResponse extends BasePacket {
    id: PacketType.WorkingCurrent;
    status: FrameStatus;
}

export interface HoldingCurrentParcent extends BasePacket {
    id: PacketType.HoldingCurrentParcent;
    holdMa: number;
}
export interface HoldingCurrentParcentResponse extends BasePacket {
    id: PacketType.HoldingCurrentParcent;
    status: FrameStatus;
}

export interface Subdivision extends BasePacket {
    id: PacketType.Subdivision;
    micstep: number;
}
export interface SubdivisionResponse extends BasePacket {
    id: PacketType.Subdivision;
    status: FrameStatus;
}

type EnableType = "high" | "low" | "hold";
const enableTypeMap: Record<number, EnableType> = {
    0: "high",
    1: "low",
    2: "hold",
};
const enableTypeMapFliped = swapFn(enableTypeMap);
export interface Enable extends BasePacket {
    id: PacketType.Enable;
    enable: EnableType;
}
export interface EnableResponse extends BasePacket {
    id: PacketType.Enable;
    status: FrameStatus;
}

type DirectionType = "cw" | "ccw";
const directionTypeMap: Record<number, DirectionType> = { 0: "cw", 1: "ccw" };
const directionTypeMapFliped = swapFn(directionTypeMap);
export interface Direction extends BasePacket {
    id: PacketType.Direction;
    direction: DirectionType;
}
export interface DirectionResponse extends BasePacket {
    id: PacketType.Direction;
    status: FrameStatus;
}

export interface AutoTurnOffScreen extends BasePacket {
    id: PacketType.AutoTurnOffScreen;
    enable: boolean;
}
export interface AutoTurnOffScreenResponse extends BasePacket {
    id: PacketType.AutoTurnOffScreen;
    status: FrameStatus;
}

export interface Protect extends BasePacket {
    id: PacketType.Protect;
    enable: boolean;
}
export interface ProtectResponse extends BasePacket {
    id: PacketType.Protect;
    status: FrameStatus;
}

export interface Mplyer extends BasePacket {
    id: PacketType.Mplyer;
    enable: boolean;
}
export interface MplyerResponse extends BasePacket {
    id: PacketType.Mplyer;
    status: FrameStatus;
}

type CanRateType = "125K" | "250K" | "500K" | "1M";
const canRateTypeMap: Record<number, CanRateType> = {
    0: "125K",
    1: "250K",
    2: "500K",
    3: "1M",
};
const canRateTypeMapFliped = swapFn(canRateTypeMap);
export interface CanRate extends BasePacket {
    id: PacketType.SetCanRate;
    rate: CanRateType;
}
export interface CanRateResponse extends BasePacket {
    id: PacketType.SetCanRate;
    status: FrameStatus;
}

export interface CanID extends BasePacket {
    id: PacketType.CanID;
    canId: number;
}
export interface CanIDResponse extends BasePacket {
    id: PacketType.CanID;
    status: FrameStatus;
}

export interface SlaveRespondActive extends BasePacket {
    id: PacketType.SlaveRespondActive;
    respond: boolean;
    active: boolean;
}
export interface SlaveRespondActiveResponse extends BasePacket {
    id: PacketType.SlaveRespondActive;
    status: FrameStatus;
}

export interface KeyLock extends BasePacket {
    id: PacketType.KeyLock;
    enable: boolean;
}
export interface KeyLockResponse extends BasePacket {
    id: PacketType.KeyLock;
    status: FrameStatus;
}

export interface SetHome extends BasePacket {
    id: PacketType.SetHome;
    endstop: boolean;
    homeDir: DirectionType;
    homeSpeed: number;
    endlimit: boolean;
}
export interface SetHomeResponse extends BasePacket {
    id: PacketType.SetHome;
    status: FrameStatus;
}

export interface GoHome extends BasePacket {
    id: PacketType.GoHome;
}

type HomeStatus = "fail" | "start" | "success";
const homeStatusTypeMap: Record<number, HomeStatus> = {
    0: "fail",
    1: "start",
    2: "success",
};
const homeStatusTypeMapFliped = swapFn(homeStatusTypeMap);
export interface GoHomeResponse extends BasePacket {
    id: PacketType.GoHome;
    status: HomeStatus;
}

export interface ZeroAxis extends BasePacket {
    id: PacketType.ZeroAxis;
}
export interface ZeroAxisResponse extends BasePacket {
    id: PacketType.ZeroAxis;
    status: FrameStatus;
}

type Mode0 = "disable" | "dir_mode" | "near_mode";
const mode0TypeMap: Record<number, Mode0> = {
    0: "disable",
    1: "dir_mode",
    2: "near_mode",
};
const mode0TypeMapFliped = swapFn(mode0TypeMap);
export interface SetMode0 extends BasePacket {
    id: PacketType.SetMode0;
    mode_0: Mode0;
    enable: boolean;
    speed: 1 | 2 | 3 | 4;
    dir: DirectionType;
}
export interface Mode0Response extends BasePacket {
    id: PacketType.SetMode0;
    status: FrameStatus;
}

export interface Reset extends BasePacket {
    id: PacketType.Reset;
}
export interface ResetResponse extends BasePacket {
    id: PacketType.Reset;
    status: FrameStatus;
}

export interface MotorStatus extends BasePacket {
    id: PacketType.MotorStatus;
}

type Status =
    | "fail"
    | "stop"
    | "speed_up"
    | "speed_down"
    | "full_speed"
    | "homing"
    | "calibrating";
const statusTypeMap: Record<number, Status> = {
    0: "fail",
    1: "stop",
    2: "speed_up",
    3: "speed_down",
    4: "full_speed",
    5: "homing",
    6: "calibrating",
};
const statusTypeMapFliped = swapFn(statusTypeMap);
export interface MotorStatusResponse extends BasePacket {
    id: PacketType.MotorStatus;
    status: Status;
}

export interface Encoder extends BasePacket {
    id: PacketType.Encoder;
}
export interface EncoderResponse extends BasePacket {
    id: PacketType.Encoder;
    carry: number;
    value: number;
}

export interface MotorSpeed extends BasePacket {
    id: PacketType.MotorSpeed;
}
export interface MotorSpeedResponse extends BasePacket {
    id: PacketType.MotorSpeed;
    speed: number;
}

export interface EncoderPulses extends BasePacket {
    id: PacketType.EncoderPulses;
}
export interface EncoderPulsesResponse extends BasePacket {
    id: PacketType.EncoderPulses;
    pulses: number;
}

export interface IOPorts extends BasePacket {
    id: PacketType.IOPorts;
}
export interface IOPortsResponse extends BasePacket {
    id: PacketType.IOPorts;
    out_1: boolean;
    out_2: boolean;
    in_1: boolean;
    in_2: boolean;
}

export interface EncoderError extends BasePacket {
    id: PacketType.EncoderError;
}
export interface EncoderErrorResponse extends BasePacket {
    id: PacketType.EncoderError;
    error: number;
}

export interface EnPinStatus extends BasePacket {
    id: PacketType.EnPinStatus;
}
export interface EnPinStatusResponse extends BasePacket {
    id: PacketType.EnPinStatus;
    enable: boolean;
}

type GoToZeroStatusType = "going" | "success" | "fail";
const goToZeroStatusMap: Record<number, GoToZeroStatusType> = {
    0: "going",
    1: "success",
    2: "fail",
};
const goToZeroStatusMapFliped = swapFn(goToZeroStatusMap);
export interface GoToZeroStatus extends BasePacket {
    id: PacketType.GoToZeroStatus;
}
export interface GoToZeroStatusResponse extends BasePacket {
    id: PacketType.GoToZeroStatus;
    status: GoToZeroStatusType;
}

export interface ReleaseShaft extends BasePacket {
    id: PacketType.ReleaseShaft;
}
export interface ReleaseShaftResponse extends BasePacket {
    id: PacketType.ReleaseShaft;
    status: FrameStatus;
}

export interface ReadShaftProtection extends BasePacket {
    id: PacketType.ReadShaftProtection;
}
export interface ReadShaftProtectionResponse extends BasePacket {
    id: PacketType.ReadShaftProtection;
    protected: boolean;
}

export interface EnableMotor extends BasePacket {
    id: PacketType.EnableMotor;
    enable: boolean;
}
export interface EnableMotorResponse extends BasePacket {
    id: PacketType.EnableMotor;
    status: FrameStatus;
}

export interface EmergencyStop extends BasePacket {
    id: PacketType.EmergencyStop;
}
export interface EmergencyStopResponse extends BasePacket {
    id: PacketType.EmergencyStop;
    status: FrameStatus;
}

export interface SpeedMode extends BasePacket {
    id: PacketType.SpeedMode;
    dir: DirectionType;
    speed: number;
    accel: number;
}
export interface SpeedModeResponse extends BasePacket {
    id: PacketType.SpeedMode;
    status: FrameStatus;
}

type SaveMode = "save" | "clean";
const saveModeMap: Record<number, SaveMode> = { 0xc8: "save", 0xca: "clean" };
const saveModeMapFliped = swapFn(saveModeMap);
export interface SaveSpeedMode extends BasePacket {
    id: PacketType.SaveSpeedMode;
    state: "save" | "clean";
}
export interface SaveSpeedModeResponse extends BasePacket {
    id: PacketType.SaveSpeedMode;
    status: FrameStatus;
}

type RelativeMotionStatus =
    | "fail"
    | "starting"
    | "complete"
    | "end_limit_stoped";
const relativeMotionStatusMap: Record<number, RelativeMotionStatus> = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const relativeMotionStatusMapFliped = swapFn(relativeMotionStatusMap);
export interface RelativeMotion extends BasePacket {
    id: PacketType.RelativeMotion;
    dir: DirectionType;
    speed: number;
    accel: number;
    pulses: number;
}
export interface RelativeMotionResponse extends BasePacket {
    id: PacketType.RelativeMotion;
    status: RelativeMotionStatus;
}

type AbsoluteMotionStatus =
    | "fail"
    | "starting"
    | "complete"
    | "end_limit_stoped";
const absoluteMotionStatusMap: Record<number, RelativeMotionStatus> = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const absoluteMotionStatusMapFliped = swapFn(absoluteMotionStatusMap);
export interface AbsoluteMotion extends BasePacket {
    id: PacketType.AbsoluteMotion;
    speed: number;
    accel: number;
    pulses: number;
}
export interface AbsoluteMotionResponse extends BasePacket {
    id: PacketType.AbsoluteMotion;
    status: AbsoluteMotionStatus;
}

type RelativeMotionAxisStatus =
    | "fail"
    | "starting"
    | "complete"
    | "end_limit_stoped";
const relativeMotionAxisStatusMap: Record<number, RelativeMotionStatus> = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const relativeMotionAxisStatusMapFliped = swapFn(relativeMotionAxisStatusMap);
export interface RelativeMotionAxis extends BasePacket {
    id: PacketType.RelativeMotionAxis;
    speed: number;
    accel: number;
    relAxis: number;
}
export interface RelativeMotionAxisResponse extends BasePacket {
    id: PacketType.RelativeMotionAxis;
    status: RelativeMotionAxisStatus;
}

type AbsoluteMotionAxisStatus =
    | "fail"
    | "starting"
    | "complete"
    | "end_limit_stoped";
const absoluteMotionAxisStatusMap: Record<number, RelativeMotionStatus> = {
    0: "fail",
    1: "starting",
    2: "complete",
    3: "end_limit_stoped",
};
const absoluteMotionAxisStatusMapFliped = swapFn(absoluteMotionAxisStatusMap);
export interface AbsoluteMotionAxis extends BasePacket {
    id: PacketType.AbsoluteMotionAxis;
    speed: number;
    accel: number;
    absAxis: number;
}
export interface AbsoluteMotionAxisResponse extends BasePacket {
    id: PacketType.AbsoluteMotionAxis;
    status: AbsoluteMotionAxisStatus;
}

export type DownlinkPackets =
    | Calibrate
    | SetWorkMode
    | WorkingCurrent
    | HoldingCurrentParcent
    | Subdivision
    | Enable
    | Direction
    | AutoTurnOffScreen
    | Protect
    | Mplyer
    | CanRate
    | CanID
    | SlaveRespondActive
    | KeyLock
    | SetHome
    | GoHome
    | ZeroAxis
    | SetMode0
    | Reset
    | MotorStatus
    | Encoder
    | MotorSpeed
    | EncoderPulses
    | IOPorts
    | EncoderError
    | EnPinStatus
    | GoToZeroStatus
    | ReleaseShaft
    | ReadShaftProtectionResponse
    | EnableMotor
    | EmergencyStop
    | SpeedMode
    | SaveSpeedMode
    | RelativeMotion
    | AbsoluteMotion
    | RelativeMotionAxis
    | AbsoluteMotionAxis;
export type UplinkPackets =
    | CalibrateResponse
    | WorkModeResponse
    | WorkingCurrentResponse
    | HoldingCurrentParcentResponse
    | SubdivisionResponse
    | EnableResponse
    | DirectionResponse
    | AutoTurnOffScreenResponse
    | ProtectResponse
    | MplyerResponse
    | CanRateResponse
    | CanIDResponse
    | SlaveRespondActiveResponse
    | KeyLockResponse
    | SetHomeResponse
    | GoHomeResponse
    | ZeroAxisResponse
    | Mode0Response
    | ResetResponse
    | MotorStatusResponse
    | EncoderResponse
    | MotorSpeedResponse
    | EncoderPulsesResponse
    | IOPortsResponse
    | EncoderErrorResponse
    | EnPinStatusResponse
    | GoToZeroStatusResponse
    | ReleaseShaftResponse
    | ReadShaftProtectionResponse
    | EnableMotorResponse
    | EmergencyStopResponse
    | SpeedModeResponse
    | SaveSpeedModeResponse
    | RelativeMotionResponse
    | AbsoluteMotionResponse
    | RelativeMotionAxisResponse
    | AbsoluteMotionAxisResponse;

type Packets = DownlinkPackets | UplinkPackets;

type PacketTypeMap = {
    [Id in DownlinkPackets["id"] | UplinkPackets["id"]]: {
        downlink: Extract<DownlinkPackets, { id: Id }>;
        uplink: Extract<UplinkPackets, { id: Id }>;
    };
};

export interface PacketHandler<T extends Packets> {
    parseData: (data: Buffer) => Omit<PacketTypeMap[T["id"]]["uplink"], "id">; // UplinkPacket based on the id
    buildData: (packet: PacketTypeMap[T["id"]]["downlink"]) => Buffer; // DownlinkPacket based on the id
}

type PacketRegistry = {
    [P in Packets as P["id"]]: PacketHandler<P>;
};

const packetRegistry: PacketRegistry = {
    [PacketType.Calibrate]: {
        parseData(data: Buffer) {
            return { status: calibrationStatusMap[data.readUInt8()] };
        },
        buildData(packet): Buffer {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(0);
            return buff;
        },
    },
    [PacketType.SetWorkMode]: {
        parseData(data: Buffer) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet): Buffer {
            const buff = Buffer.alloc(1);
            buff.writeUint8(workModeMapFliped[packet.mode]);
            return buff;
        },
    },
    [PacketType.WorkingCurrent]: {
        parseData(data: Buffer) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet): Buffer {
            const buff = Buffer.alloc(2);
            buff.writeUint16BE(packet.ma);
            return buff;
        },
    },
    [PacketType.HoldingCurrentParcent]: {
        parseData(data: Buffer) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet): Buffer {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.holdMa);
            return buff;
        },
    },
    [PacketType.Subdivision]: {
        parseData(data: Buffer) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet): Buffer {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.micstep);
            return buff;
        },
    },
    [PacketType.Enable]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(enableTypeMapFliped[packet.enable]);
            return buff;
        },
    },
    [PacketType.Direction]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(directionTypeMapFliped[packet.direction]);
            return buff;
        },
    },
    [PacketType.AutoTurnOffScreen]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.Protect]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.Mplyer]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.SetCanRate]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(canRateTypeMapFliped[packet.rate]);
            return buff;
        },
    },
    [PacketType.CanID]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(2);
            buff.writeInt16BE(packet.canId);
            return buff;
        },
    },
    [PacketType.SlaveRespondActive]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(2);
            buff.writeUint8(packet.respond ? 1 : 0, 0);
            buff.writeUint8(packet.active ? 1 : 0, 1);
            return buff;
        },
    },
    [PacketType.KeyLock]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUint8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.SetHome]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(5);
            buff.writeUint8(packet.endstop ? 1 : 0);
            buff.writeUint8(directionTypeMapFliped[packet.homeDir], 1);
            buff.writeUint16BE(packet.homeSpeed, 2);
            buff.writeUint8(packet.endlimit ? 1 : 0, 4);
            return buff;
        },
    },
    [PacketType.GoHome]: {
        parseData(data) {
            return { status: homeStatusTypeMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(0);
            return buff;
        },
    },
    [PacketType.ZeroAxis]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(0);
            return buff;
        },
    },
    [PacketType.SetMode0]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(4);
            buff.writeUint8(mode0TypeMapFliped[packet.mode_0]);
            buff.writeUint8(packet.enable ? 1 : 0, 1);
            buff.writeUint8(packet.speed, 2);
            buff.writeUint8(directionTypeMapFliped[packet.dir], 3);
            return buff;
        },
    },
    [PacketType.Reset]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.MotorStatus]: {
        parseData(data) {
            return { status: statusTypeMap[data.readUInt8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.Encoder]: {
        parseData(data) {
            return {
                carry: data.readUInt32BE(),
                value: data.readUInt32BE(5),
            };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.MotorSpeed]: {
        parseData(data) {
            return { speed: data.readUIntBE(0, 6) };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EncoderPulses]: {
        parseData(data) {
            return { pulses: data.readUInt32BE() };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.IOPorts]: {
        parseData(data) {
            const status = data.readUint8();
            return {
                in_1: Boolean(status & 0b0000_0001),
                in_2: Boolean(status & 0b0000_0010),
                out_1: Boolean(status & 0b0000_0100),
                out_2: Boolean(status & 0b0000_1000),
            };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EncoderError]: {
        parseData(data) {
            return { error: data.readUint32BE() };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EnPinStatus]: {
        parseData(data) {
            return { enable: data.readUint8() === 1 };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.GoToZeroStatus]: {
        parseData(data) {
            return { status: goToZeroStatusMap[data.readUint8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.ReleaseShaft]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUint8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.ReadShaftProtection]: {
        parseData(data) {
            return { protected: data.readUint8() == 1 };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.EnableMotor]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(packet.enable ? 1 : 0);
            return buff;
        },
    },
    [PacketType.EmergencyStop]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            return Buffer.alloc(0);
        },
    },
    [PacketType.SpeedMode]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            assert(packet.speed >= 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(3);
            const view = new BitView(buff);
            buff.writeUint8(3, packet.accel);
            view.setBits(0, directionTypeMapFliped[packet.dir], 1);
            view.setBits(1, 0, 3);
            view.setBits(4, packet.speed, 10);
            return buff;
        },
    },
    [PacketType.SaveSpeedMode]: {
        parseData(data) {
            return { status: frameStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            const buff = Buffer.alloc(1);
            buff.writeUInt8(saveModeMapFliped[packet.state]);
            return buff;
        },
    },
    [PacketType.RelativeMotion]: {
        parseData(data) {
            return { status: relativeMotionStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            assert(packet.speed >= 0 && packet.speed <= 3000);
            assert(packet.pulses > 0 && packet.pulses <= 0xffffff);
            const buff = Buffer.alloc(6);
            const view = new BitView(buff);
            buff.writeUint8(3, packet.accel); // acc
            buff.writeUintBE(packet.pulses, 4, 3); // pulses
            view.setBits(0, directionTypeMapFliped[packet.dir], 1); // dir
            view.setBits(1, 0, 3); // rev
            view.setBits(4, packet.speed, 10); // speed
            return buff;
        },
    },
    [PacketType.AbsoluteMotion]: {
        parseData(data) {
            return { status: absoluteMotionStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            assert(packet.speed >= 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(6);
            buff.writeInt16BE(packet.speed);
            buff.writeUint8(packet.accel, 2);
            buff.writeIntBE(packet.pulses, 3, 3);
            return buff;
        },
    },
    [PacketType.RelativeMotionAxis]: {
        parseData(data) {
            return { status: relativeMotionAxisStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            assert(packet.speed >= 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(6);
            buff.writeInt16BE(packet.speed);
            buff.writeUint8(packet.accel, 2);
            buff.writeIntBE(packet.relAxis, 3, 3);
            return buff;
        },
    },
    [PacketType.AbsoluteMotionAxis]: {
        parseData(data) {
            return { status: absoluteMotionAxisStatusMap[data.readUInt8()] };
        },
        buildData(packet) {
            assert(packet.speed > 0 && packet.speed <= 3000);
            const buff = Buffer.alloc(6);
            buff.writeInt16BE(packet.speed);
            buff.writeUint8(packet.accel, 2);
            buff.writeIntBE(packet.absAxis, 3, 3);
            return buff;
        },
    },
};

const checksum = (deviceId: number, data: Buffer) =>
    (deviceId + data.reduce((sum, byte) => sum + byte, 0)) & 0xff;

const decodePacketData = (deviceId: number, data: Buffer): Buffer | null => {
    const crc = data[data.length - 1];
    const dataArray = data.subarray(0, -1); // Remove CRC
    const dataSum = checksum(deviceId, dataArray);

    // if (dataSum !== crc) throw new Error(`Invalid checksum: ${dataSum}`);
    // console.log('res', dataArray);
    return Buffer.from(dataArray);
};

const buildPacketData = (
    deviceId: number,
    packetId: number,
    dataFields: Buffer
): Buffer => {
    const out = Buffer.alloc(dataFields.length + 2);
    out.writeUint8(packetId);
    dataFields.copy(out, 1);
    const c = checksum(deviceId, out);
    out.writeUint8(c, out.length - 1);
    // console.log("encoding", out);
    return out;
};

export function decodePacket(
    deviceId: number,
    data: Buffer
): UplinkPackets | null {
    const validatedData = decodePacketData(deviceId, data);
    if (!validatedData) return null;

    const id = validatedData[0] as Packets["id"];
    if (!isValidPacketId(id)) {
        throw new Error(`Invalid packet ID: ${id}`);
    }

    const handler = packetRegistry[id];
    if (!handler) {
        throw new Error(`No handler found for packet ID: ${id}`);
    }
    return {
        id: id as number,
        ...handler.parseData(validatedData.subarray(1)),
    };
}

function isValidPacketId(id: number): id is keyof PacketRegistry {
    return id in packetRegistry;
}

export function encodePacket<T extends DownlinkPackets>(
    deviceId: number,
    packet: T
): Buffer {
    if (!isValidPacketId(packet.id)) {
        throw new Error(`Invalid packet ID: ${packet.id}`);
    }
    const handler = packetRegistry[packet.id];
    const rawDataFields = handler.buildData(packet as any);

    return buildPacketData(deviceId, packet.id, rawDataFields);
}

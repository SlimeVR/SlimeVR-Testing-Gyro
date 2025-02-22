"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAxis0_Get_Version = parseAxis0_Get_Version;
exports.parseAxis0_Heartbeat = parseAxis0_Heartbeat;
exports.parseAxis0_Estop = parseAxis0_Estop;
exports.parseAxis0_Get_Error = parseAxis0_Get_Error;
exports.parseAxis0_RxSdo = parseAxis0_RxSdo;
exports.parseAxis0_TxSdo = parseAxis0_TxSdo;
exports.parseAxis0_Address = parseAxis0_Address;
exports.parseAxis0_Set_Axis_State = parseAxis0_Set_Axis_State;
exports.parseAxis0_Get_Encoder_Estimates = parseAxis0_Get_Encoder_Estimates;
exports.parseAxis0_Set_Controller_Mode = parseAxis0_Set_Controller_Mode;
exports.parseAxis0_Set_Input_Pos = parseAxis0_Set_Input_Pos;
exports.parseAxis0_Set_Input_Vel = parseAxis0_Set_Input_Vel;
exports.parseAxis0_Set_Input_Torque = parseAxis0_Set_Input_Torque;
exports.parseAxis0_Set_Limits = parseAxis0_Set_Limits;
exports.parseAxis0_Set_Traj_Vel_Limit = parseAxis0_Set_Traj_Vel_Limit;
exports.parseAxis0_Set_Traj_Accel_Limits = parseAxis0_Set_Traj_Accel_Limits;
exports.parseAxis0_Set_Traj_Inertia = parseAxis0_Set_Traj_Inertia;
exports.parseAxis0_Get_Iq = parseAxis0_Get_Iq;
exports.parseAxis0_Get_Temperature = parseAxis0_Get_Temperature;
exports.parseAxis0_Reboot = parseAxis0_Reboot;
exports.parseAxis0_Get_Bus_Voltage_Current = parseAxis0_Get_Bus_Voltage_Current;
exports.parseAxis0_Clear_Errors = parseAxis0_Clear_Errors;
exports.parseAxis0_Set_Absolute_Position = parseAxis0_Set_Absolute_Position;
exports.parseAxis0_Set_Pos_Gain = parseAxis0_Set_Pos_Gain;
exports.parseAxis0_Set_Vel_Gains = parseAxis0_Set_Vel_Gains;
exports.parseAxis0_Get_Torques = parseAxis0_Get_Torques;
exports.parseAxis0_Get_Powers = parseAxis0_Get_Powers;
exports.parseAxis0_Enter_DFU_Mode = parseAxis0_Enter_DFU_Mode;
exports.parseAxis1_Get_Version = parseAxis1_Get_Version;
exports.parseAxis1_Heartbeat = parseAxis1_Heartbeat;
exports.parseAxis1_Estop = parseAxis1_Estop;
exports.parseAxis1_Get_Error = parseAxis1_Get_Error;
exports.parseAxis1_RxSdo = parseAxis1_RxSdo;
exports.parseAxis1_TxSdo = parseAxis1_TxSdo;
exports.parseAxis1_Address = parseAxis1_Address;
exports.parseAxis1_Set_Axis_State = parseAxis1_Set_Axis_State;
exports.parseAxis1_Get_Encoder_Estimates = parseAxis1_Get_Encoder_Estimates;
exports.parseAxis1_Set_Controller_Mode = parseAxis1_Set_Controller_Mode;
exports.parseAxis1_Set_Input_Pos = parseAxis1_Set_Input_Pos;
exports.parseAxis1_Set_Input_Vel = parseAxis1_Set_Input_Vel;
exports.parseAxis1_Set_Input_Torque = parseAxis1_Set_Input_Torque;
exports.parseAxis1_Set_Limits = parseAxis1_Set_Limits;
exports.parseAxis1_Set_Traj_Vel_Limit = parseAxis1_Set_Traj_Vel_Limit;
exports.parseAxis1_Set_Traj_Accel_Limits = parseAxis1_Set_Traj_Accel_Limits;
exports.parseAxis1_Set_Traj_Inertia = parseAxis1_Set_Traj_Inertia;
exports.parseAxis1_Get_Iq = parseAxis1_Get_Iq;
exports.parseAxis1_Get_Temperature = parseAxis1_Get_Temperature;
exports.parseAxis1_Reboot = parseAxis1_Reboot;
exports.parseAxis1_Get_Bus_Voltage_Current = parseAxis1_Get_Bus_Voltage_Current;
exports.parseAxis1_Clear_Errors = parseAxis1_Clear_Errors;
exports.parseAxis1_Set_Absolute_Position = parseAxis1_Set_Absolute_Position;
exports.parseAxis1_Set_Pos_Gain = parseAxis1_Set_Pos_Gain;
exports.parseAxis1_Set_Vel_Gains = parseAxis1_Set_Vel_Gains;
exports.parseAxis1_Get_Torques = parseAxis1_Get_Torques;
exports.parseAxis1_Get_Powers = parseAxis1_Get_Powers;
exports.parseAxis1_Enter_DFU_Mode = parseAxis1_Enter_DFU_Mode;
exports.parseAxis2_Get_Version = parseAxis2_Get_Version;
exports.parseAxis2_Heartbeat = parseAxis2_Heartbeat;
exports.parseAxis2_Estop = parseAxis2_Estop;
exports.parseAxis2_Get_Error = parseAxis2_Get_Error;
exports.parseAxis2_RxSdo = parseAxis2_RxSdo;
exports.parseAxis2_TxSdo = parseAxis2_TxSdo;
exports.parseAxis2_Address = parseAxis2_Address;
exports.parseAxis2_Set_Axis_State = parseAxis2_Set_Axis_State;
exports.parseAxis2_Get_Encoder_Estimates = parseAxis2_Get_Encoder_Estimates;
exports.parseAxis2_Set_Controller_Mode = parseAxis2_Set_Controller_Mode;
exports.parseAxis2_Set_Input_Pos = parseAxis2_Set_Input_Pos;
exports.parseAxis2_Set_Input_Vel = parseAxis2_Set_Input_Vel;
exports.parseAxis2_Set_Input_Torque = parseAxis2_Set_Input_Torque;
exports.parseAxis2_Set_Limits = parseAxis2_Set_Limits;
exports.parseAxis2_Set_Traj_Vel_Limit = parseAxis2_Set_Traj_Vel_Limit;
exports.parseAxis2_Set_Traj_Accel_Limits = parseAxis2_Set_Traj_Accel_Limits;
exports.parseAxis2_Set_Traj_Inertia = parseAxis2_Set_Traj_Inertia;
exports.parseAxis2_Get_Iq = parseAxis2_Get_Iq;
exports.parseAxis2_Get_Temperature = parseAxis2_Get_Temperature;
exports.parseAxis2_Reboot = parseAxis2_Reboot;
exports.parseAxis2_Get_Bus_Voltage_Current = parseAxis2_Get_Bus_Voltage_Current;
exports.parseAxis2_Clear_Errors = parseAxis2_Clear_Errors;
exports.parseAxis2_Set_Absolute_Position = parseAxis2_Set_Absolute_Position;
exports.parseAxis2_Set_Pos_Gain = parseAxis2_Set_Pos_Gain;
exports.parseAxis2_Set_Vel_Gains = parseAxis2_Set_Vel_Gains;
exports.parseAxis2_Get_Torques = parseAxis2_Get_Torques;
exports.parseAxis2_Get_Powers = parseAxis2_Get_Powers;
exports.parseAxis2_Enter_DFU_Mode = parseAxis2_Enter_DFU_Mode;
exports.parseAxis3_Get_Version = parseAxis3_Get_Version;
exports.parseAxis3_Heartbeat = parseAxis3_Heartbeat;
exports.parseAxis3_Estop = parseAxis3_Estop;
exports.parseAxis3_Get_Error = parseAxis3_Get_Error;
exports.parseAxis3_RxSdo = parseAxis3_RxSdo;
exports.parseAxis3_TxSdo = parseAxis3_TxSdo;
exports.parseAxis3_Address = parseAxis3_Address;
exports.parseAxis3_Set_Axis_State = parseAxis3_Set_Axis_State;
exports.parseAxis3_Get_Encoder_Estimates = parseAxis3_Get_Encoder_Estimates;
exports.parseAxis3_Set_Controller_Mode = parseAxis3_Set_Controller_Mode;
exports.parseAxis3_Set_Input_Pos = parseAxis3_Set_Input_Pos;
exports.parseAxis3_Set_Input_Vel = parseAxis3_Set_Input_Vel;
exports.parseAxis3_Set_Input_Torque = parseAxis3_Set_Input_Torque;
exports.parseAxis3_Set_Limits = parseAxis3_Set_Limits;
exports.parseAxis3_Set_Traj_Vel_Limit = parseAxis3_Set_Traj_Vel_Limit;
exports.parseAxis3_Set_Traj_Accel_Limits = parseAxis3_Set_Traj_Accel_Limits;
exports.parseAxis3_Set_Traj_Inertia = parseAxis3_Set_Traj_Inertia;
exports.parseAxis3_Get_Iq = parseAxis3_Get_Iq;
exports.parseAxis3_Get_Temperature = parseAxis3_Get_Temperature;
exports.parseAxis3_Reboot = parseAxis3_Reboot;
exports.parseAxis3_Get_Bus_Voltage_Current = parseAxis3_Get_Bus_Voltage_Current;
exports.parseAxis3_Clear_Errors = parseAxis3_Clear_Errors;
exports.parseAxis3_Set_Absolute_Position = parseAxis3_Set_Absolute_Position;
exports.parseAxis3_Set_Pos_Gain = parseAxis3_Set_Pos_Gain;
exports.parseAxis3_Set_Vel_Gains = parseAxis3_Set_Vel_Gains;
exports.parseAxis3_Get_Torques = parseAxis3_Get_Torques;
exports.parseAxis3_Get_Powers = parseAxis3_Get_Powers;
exports.parseAxis3_Enter_DFU_Mode = parseAxis3_Enter_DFU_Mode;
exports.parseAxis4_Get_Version = parseAxis4_Get_Version;
exports.parseAxis4_Heartbeat = parseAxis4_Heartbeat;
exports.parseAxis4_Estop = parseAxis4_Estop;
exports.parseAxis4_Get_Error = parseAxis4_Get_Error;
exports.parseAxis4_RxSdo = parseAxis4_RxSdo;
exports.parseAxis4_TxSdo = parseAxis4_TxSdo;
exports.parseAxis4_Address = parseAxis4_Address;
exports.parseAxis4_Set_Axis_State = parseAxis4_Set_Axis_State;
exports.parseAxis4_Get_Encoder_Estimates = parseAxis4_Get_Encoder_Estimates;
exports.parseAxis4_Set_Controller_Mode = parseAxis4_Set_Controller_Mode;
exports.parseAxis4_Set_Input_Pos = parseAxis4_Set_Input_Pos;
exports.parseAxis4_Set_Input_Vel = parseAxis4_Set_Input_Vel;
exports.parseAxis4_Set_Input_Torque = parseAxis4_Set_Input_Torque;
exports.parseAxis4_Set_Limits = parseAxis4_Set_Limits;
exports.parseAxis4_Set_Traj_Vel_Limit = parseAxis4_Set_Traj_Vel_Limit;
exports.parseAxis4_Set_Traj_Accel_Limits = parseAxis4_Set_Traj_Accel_Limits;
exports.parseAxis4_Set_Traj_Inertia = parseAxis4_Set_Traj_Inertia;
exports.parseAxis4_Get_Iq = parseAxis4_Get_Iq;
exports.parseAxis4_Get_Temperature = parseAxis4_Get_Temperature;
exports.parseAxis4_Reboot = parseAxis4_Reboot;
exports.parseAxis4_Get_Bus_Voltage_Current = parseAxis4_Get_Bus_Voltage_Current;
exports.parseAxis4_Clear_Errors = parseAxis4_Clear_Errors;
exports.parseAxis4_Set_Absolute_Position = parseAxis4_Set_Absolute_Position;
exports.parseAxis4_Set_Pos_Gain = parseAxis4_Set_Pos_Gain;
exports.parseAxis4_Set_Vel_Gains = parseAxis4_Set_Vel_Gains;
exports.parseAxis4_Get_Torques = parseAxis4_Get_Torques;
exports.parseAxis4_Get_Powers = parseAxis4_Get_Powers;
exports.parseAxis4_Enter_DFU_Mode = parseAxis4_Enter_DFU_Mode;
exports.parseAxis5_Get_Version = parseAxis5_Get_Version;
exports.parseAxis5_Heartbeat = parseAxis5_Heartbeat;
exports.parseAxis5_Estop = parseAxis5_Estop;
exports.parseAxis5_Get_Error = parseAxis5_Get_Error;
exports.parseAxis5_RxSdo = parseAxis5_RxSdo;
exports.parseAxis5_TxSdo = parseAxis5_TxSdo;
exports.parseAxis5_Address = parseAxis5_Address;
exports.parseAxis5_Set_Axis_State = parseAxis5_Set_Axis_State;
exports.parseAxis5_Get_Encoder_Estimates = parseAxis5_Get_Encoder_Estimates;
exports.parseAxis5_Set_Controller_Mode = parseAxis5_Set_Controller_Mode;
exports.parseAxis5_Set_Input_Pos = parseAxis5_Set_Input_Pos;
exports.parseAxis5_Set_Input_Vel = parseAxis5_Set_Input_Vel;
exports.parseAxis5_Set_Input_Torque = parseAxis5_Set_Input_Torque;
exports.parseAxis5_Set_Limits = parseAxis5_Set_Limits;
exports.parseAxis5_Set_Traj_Vel_Limit = parseAxis5_Set_Traj_Vel_Limit;
exports.parseAxis5_Set_Traj_Accel_Limits = parseAxis5_Set_Traj_Accel_Limits;
exports.parseAxis5_Set_Traj_Inertia = parseAxis5_Set_Traj_Inertia;
exports.parseAxis5_Get_Iq = parseAxis5_Get_Iq;
exports.parseAxis5_Get_Temperature = parseAxis5_Get_Temperature;
exports.parseAxis5_Reboot = parseAxis5_Reboot;
exports.parseAxis5_Get_Bus_Voltage_Current = parseAxis5_Get_Bus_Voltage_Current;
exports.parseAxis5_Clear_Errors = parseAxis5_Clear_Errors;
exports.parseAxis5_Set_Absolute_Position = parseAxis5_Set_Absolute_Position;
exports.parseAxis5_Set_Pos_Gain = parseAxis5_Set_Pos_Gain;
exports.parseAxis5_Set_Vel_Gains = parseAxis5_Set_Vel_Gains;
exports.parseAxis5_Get_Torques = parseAxis5_Get_Torques;
exports.parseAxis5_Get_Powers = parseAxis5_Get_Powers;
exports.parseAxis5_Enter_DFU_Mode = parseAxis5_Enter_DFU_Mode;
exports.parseAxis6_Get_Version = parseAxis6_Get_Version;
exports.parseAxis6_Heartbeat = parseAxis6_Heartbeat;
exports.parseAxis6_Estop = parseAxis6_Estop;
exports.parseAxis6_Get_Error = parseAxis6_Get_Error;
exports.parseAxis6_RxSdo = parseAxis6_RxSdo;
exports.parseAxis6_TxSdo = parseAxis6_TxSdo;
exports.parseAxis6_Address = parseAxis6_Address;
exports.parseAxis6_Set_Axis_State = parseAxis6_Set_Axis_State;
exports.parseAxis6_Get_Encoder_Estimates = parseAxis6_Get_Encoder_Estimates;
exports.parseAxis6_Set_Controller_Mode = parseAxis6_Set_Controller_Mode;
exports.parseAxis6_Set_Input_Pos = parseAxis6_Set_Input_Pos;
exports.parseAxis6_Set_Input_Vel = parseAxis6_Set_Input_Vel;
exports.parseAxis6_Set_Input_Torque = parseAxis6_Set_Input_Torque;
exports.parseAxis6_Set_Limits = parseAxis6_Set_Limits;
exports.parseAxis6_Set_Traj_Vel_Limit = parseAxis6_Set_Traj_Vel_Limit;
exports.parseAxis6_Set_Traj_Accel_Limits = parseAxis6_Set_Traj_Accel_Limits;
exports.parseAxis6_Set_Traj_Inertia = parseAxis6_Set_Traj_Inertia;
exports.parseAxis6_Get_Iq = parseAxis6_Get_Iq;
exports.parseAxis6_Get_Temperature = parseAxis6_Get_Temperature;
exports.parseAxis6_Reboot = parseAxis6_Reboot;
exports.parseAxis6_Get_Bus_Voltage_Current = parseAxis6_Get_Bus_Voltage_Current;
exports.parseAxis6_Clear_Errors = parseAxis6_Clear_Errors;
exports.parseAxis6_Set_Absolute_Position = parseAxis6_Set_Absolute_Position;
exports.parseAxis6_Set_Pos_Gain = parseAxis6_Set_Pos_Gain;
exports.parseAxis6_Set_Vel_Gains = parseAxis6_Set_Vel_Gains;
exports.parseAxis6_Get_Torques = parseAxis6_Get_Torques;
exports.parseAxis6_Get_Powers = parseAxis6_Get_Powers;
exports.parseAxis6_Enter_DFU_Mode = parseAxis6_Enter_DFU_Mode;
exports.parseAxis7_Get_Version = parseAxis7_Get_Version;
exports.parseAxis7_Heartbeat = parseAxis7_Heartbeat;
exports.parseAxis7_Estop = parseAxis7_Estop;
exports.parseAxis7_Get_Error = parseAxis7_Get_Error;
exports.parseAxis7_RxSdo = parseAxis7_RxSdo;
exports.parseAxis7_TxSdo = parseAxis7_TxSdo;
exports.parseAxis7_Address = parseAxis7_Address;
exports.parseAxis7_Set_Axis_State = parseAxis7_Set_Axis_State;
exports.parseAxis7_Get_Encoder_Estimates = parseAxis7_Get_Encoder_Estimates;
exports.parseAxis7_Set_Controller_Mode = parseAxis7_Set_Controller_Mode;
exports.parseAxis7_Set_Input_Pos = parseAxis7_Set_Input_Pos;
exports.parseAxis7_Set_Input_Vel = parseAxis7_Set_Input_Vel;
exports.parseAxis7_Set_Input_Torque = parseAxis7_Set_Input_Torque;
exports.parseAxis7_Set_Limits = parseAxis7_Set_Limits;
exports.parseAxis7_Set_Traj_Vel_Limit = parseAxis7_Set_Traj_Vel_Limit;
exports.parseAxis7_Set_Traj_Accel_Limits = parseAxis7_Set_Traj_Accel_Limits;
exports.parseAxis7_Set_Traj_Inertia = parseAxis7_Set_Traj_Inertia;
exports.parseAxis7_Get_Iq = parseAxis7_Get_Iq;
exports.parseAxis7_Get_Temperature = parseAxis7_Get_Temperature;
exports.parseAxis7_Reboot = parseAxis7_Reboot;
exports.parseAxis7_Get_Bus_Voltage_Current = parseAxis7_Get_Bus_Voltage_Current;
exports.parseAxis7_Clear_Errors = parseAxis7_Clear_Errors;
exports.parseAxis7_Set_Absolute_Position = parseAxis7_Set_Absolute_Position;
exports.parseAxis7_Set_Pos_Gain = parseAxis7_Set_Pos_Gain;
exports.parseAxis7_Set_Vel_Gains = parseAxis7_Set_Vel_Gains;
exports.parseAxis7_Get_Torques = parseAxis7_Get_Torques;
exports.parseAxis7_Get_Powers = parseAxis7_Get_Powers;
exports.parseAxis7_Enter_DFU_Mode = parseAxis7_Enter_DFU_Mode;
function parseAxis0_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis0_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Estop(data) {
    return {};
}
function parseAxis0_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis0_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis0_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis0_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis0_Enter_DFU_Mode(data) {
    return {};
}
function parseAxis1_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis1_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Estop(data) {
    return {};
}
function parseAxis1_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis1_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis1_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis1_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis1_Enter_DFU_Mode(data) {
    return {};
}
function parseAxis2_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis2_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Estop(data) {
    return {};
}
function parseAxis2_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis2_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis2_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis2_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis2_Enter_DFU_Mode(data) {
    return {};
}
function parseAxis3_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis3_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Estop(data) {
    return {};
}
function parseAxis3_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis3_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis3_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis3_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis3_Enter_DFU_Mode(data) {
    return {};
}
function parseAxis4_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis4_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Estop(data) {
    return {};
}
function parseAxis4_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis4_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis4_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis4_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis4_Enter_DFU_Mode(data) {
    return {};
}
function parseAxis5_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis5_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Estop(data) {
    return {};
}
function parseAxis5_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis5_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis5_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis5_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis5_Enter_DFU_Mode(data) {
    return {};
}
function parseAxis6_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis6_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Estop(data) {
    return {};
}
function parseAxis6_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis6_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis6_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis6_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis6_Enter_DFU_Mode(data) {
    return {};
}
function parseAxis7_Get_Version(data) {
    return {
        Fw_Version_Unreleased: data.readUInt8LE(56) * 1 + 0,
        Fw_Version_Revision: data.readUInt8LE(48) * 1 + 0,
        Fw_Version_Minor: data.readUInt8LE(40) * 1 + 0,
        Fw_Version_Major: data.readUInt8LE(32) * 1 + 0,
        Hw_Version_Variant: data.readUInt8LE(24) * 1 + 0,
        Hw_Version_Minor: data.readUInt8LE(16) * 1 + 0,
        Hw_Version_Major: data.readUInt8LE(8) * 1 + 0,
        Protocol_Version: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis7_Heartbeat(data) {
    return {
        Trajectory_Done_Flag: data.readUInt1LE(48) * 1 + 0,
        Procedure_Result: data.readUInt8LE(40) * 1 + 0,
        Axis_State: data.readUInt8LE(32) * 1 + 0,
        Axis_Error: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Estop(data) {
    return {};
}
function parseAxis7_Get_Error(data) {
    return {
        Disarm_Reason: data.readUInt32LE(32) * 1 + 0,
        Active_Errors: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_RxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved: data.readUInt8LE(24) * 1 + 0,
        Opcode: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis7_TxSdo(data) {
    return {
        Value: data.readUInt32LE(32) * 1 + 0,
        Reserved1: data.readUInt8LE(24) * 1 + 0,
        Reserved0: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis7_Address(data) {
    return {
        Serial_Number: data.readUInt48LE(8) * 1 + 0,
        Node_ID: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Axis_State(data) {
    return {
        Axis_Requested_State: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Get_Encoder_Estimates(data) {
    return {
        Vel_Estimate: data.readUInt32LE(32) * 1 + 0,
        Pos_Estimate: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Controller_Mode(data) {
    return {
        Input_Mode: data.readUInt32LE(32) * 1 + 0,
        Control_Mode: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Input_Pos(data) {
    return {
        Torque_FF: data.readUInt16LE(48) * 0.001 + 0,
        Vel_FF: data.readUInt16LE(32) * 0.001 + 0,
        Input_Pos: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Input_Vel(data) {
    return {
        Input_Torque_FF: data.readUInt32LE(32) * 1 + 0,
        Input_Vel: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Input_Torque(data) {
    return {
        Input_Torque: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Limits(data) {
    return {
        Current_Limit: data.readUInt32LE(32) * 1 + 0,
        Velocity_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Traj_Vel_Limit(data) {
    return {
        Traj_Vel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Traj_Accel_Limits(data) {
    return {
        Traj_Decel_Limit: data.readUInt32LE(32) * 1 + 0,
        Traj_Accel_Limit: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Traj_Inertia(data) {
    return {
        Traj_Inertia: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Get_Iq(data) {
    return {
        Iq_Measured: data.readUInt32LE(32) * 1 + 0,
        Iq_Setpoint: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Get_Temperature(data) {
    return {
        Motor_Temperature: data.readUInt32LE(32) * 1 + 0,
        FET_Temperature: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Reboot(data) {
    return {
        Action: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis7_Get_Bus_Voltage_Current(data) {
    return {
        Bus_Current: data.readUInt32LE(32) * 1 + 0,
        Bus_Voltage: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Clear_Errors(data) {
    return {
        Identify: data.readUInt8LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Absolute_Position(data) {
    return {
        Position: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Pos_Gain(data) {
    return {
        Pos_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Set_Vel_Gains(data) {
    return {
        Vel_Integrator_Gain: data.readUInt32LE(32) * 1 + 0,
        Vel_Gain: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Get_Torques(data) {
    return {
        Torque_Estimate: data.readUInt32LE(32) * 1 + 0,
        Torque_Target: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Get_Powers(data) {
    return {
        Mechanical_Power: data.readUInt32LE(32) * 1 + 0,
        Electrical_Power: data.readUInt32LE(0) * 1 + 0
    };
}
function parseAxis7_Enter_DFU_Mode(data) {
    return {};
}

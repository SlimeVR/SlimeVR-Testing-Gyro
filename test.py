#!/usr/bin/env python

"""
This example shows how sending a single message works.
"""

import can


def send_one():
    """Sends a single message."""

    # this uses the default configuration (for example from the config file)
    # see https://python-can.readthedocs.io/en/stable/configuration.html
    with can.Bus(interface='socketcan', channel='can0', bitrate=500000) as bus:
        # Using specific buses works similar:
        # bus = can.Bus(interface='socketcan', channel='vcan0', bitrate=250000)
        # bus = can.Bus(interface='pcan', channel='PCAN_USBBUS1', bitrate=250000)
        # bus = can.Bus(interface='ixxat', channel=0, bitrate=250000)
        # bus = can.Bus(interface='vector', app_name='CANalyzer', channel=0, bitrate=250000)
        # ...

        msg = can.Message(
            arbitration_id=0x001, data=[91,92], dlc=2, is_extended_id=False
        )

        try:
            bus.send(msg)
            print(f"Message sent on {bus.channel_info}")
        except can.CanError:
            print("Message NOT sent")


if __name__ == "__main__":
    send_one()
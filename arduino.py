#!/usr/bin/python

import fileinput
import pyfirmata
import time
import sys
import signal

board = None
pins = None

def flashOnBoardLED():
	led = board.get_pin('d:13:o')
	while True:
		print 'beep!'
		led.write(1)
		time.sleep(1)
		led.write(0)
		time.sleep(1)

def board():
	print 'Initializing board...',
	sys.stdout.flush()
	global board
	board = pyfirmata.Arduino('/dev/ttyACM0')
	print 'done'
	sys.stdout.flush()
	global pins
	pins = []
	for pin in range(2,12):
		print 'Initializing pin', pin
		pins.append(board.get_pin('d:' + str(pin).zfill(2) + ':o'))

def jellyfish():
	state = True;
	while True:
		for pin in pins:
			toggle(pin, state)
			time.sleep(0.1)
		state = not state
	board.exit()

def toggle(pin, state):
	print 'setting pin to ' + str(state)
	if state:
		pin.write(1)
	else:
		pin.write(0)

def readInput():
	#watchFor = 'Susan G. Komen'
	#watchFor = 'American Association of Retired Persons (AARP)'
	watchFor = 'Livestrong'
	while True:
		line = sys.stdin.readline()
		if line == '':
			continue
		try:
			percentage, cause = line.strip().split('\t')
			if cause == watchFor:
				turnOnFirstN(int(percentage.split('%')[0])/10)
		except:
			print 'wtf is this line?', line

def destroy(signal, frame):
	print 'Stopping board...',
	if board != None:
		board.exit()
	print 'done'
	exit()

def turnOnFirstN(n):
	for i in range(n):
		pins[i].write(1)
	for i in range(n,10):
		pins[i].write(0)

signal.signal(signal.SIGINT, destroy)
board()
#jellyfish()
#flashOnBoardLED()
readInput()


#!/usr/bin/python

import fileinput
import pyfirmata
import time
import sys
import signal

board = None

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

def jellyfish():
	pins = []
	for pin in range(2,12):
		print 'Initializing pin', pin
		pins.append(board.get_pin('d:' + str(pin).zfill(2) + ':o'))
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
	watchFor = 'Susan G. Komen'
	for line in fileinput.input():
		percentage, cause = line.strip().split('\t')
		if cause == watchFor:
			print percentage

def destroy(signal, frame):
	print 'Stopping board...',
	if board != None:
		board.exit()
	print 'done'

def turnOnFirstN(n):
	for i in range(n):
		pin[i].write(1)
	for i in range(n,11):
		pin[i].write(0)

signal.signal(signal.SIGINT, destroy)
board()
jellyfish()
turnOnFirstN(3)
time.wait(2)
turnOnFirstN(8)
time.wait(2)
turnOnFirstN(0)
time.wait(2)
turnOnFirstN(10)

#flashOnBoardLED()


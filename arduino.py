#!/usr/bin/python

import fileinput
import pyfirmata

watchFor = 'Susan G. Komen'

board = pyfirmata.Arduino('/dev/ttyACM0');

for line in fileinput.input():
	percentage, cause = line.strip().split('\t')
	if cause == watchFor:
		print percentage

/*
  Copyright (C) 2012 James Coliz, Jr. <maniacbug@ymail.com>

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  version 2 as published by the Free Software Foundation.

  Update 2014 - TMRh20
*/

/**
   Simplest possible example of using RF24Network,

   RECEIVER NODE
   Listens for messages from the transmitter and prints them out.
*/

#include <RF24Network.h>
#include <RF24.h>
#include <SPI.h>


RF24 radio(7, 8);               // nRF24L01(+) radio attached using Getting Started board


RF24Network network(radio);      // Network uses that radio
const uint16_t this_node = 00;    // Address of our node in Octal format ( 04,031, etc)
const uint16_t other_node = 01;   // Address of the other node in Octal format

int id = 0;

/**
   type: 0 - get, 1 - reply (get), 2 - notify, 3 - put, 4 - ack (put), 5 - set id
*/
struct payload_t {                 // Structure of our payload
  unsigned long value;
  unsigned long id;
  unsigned long type;
};

int state = 1;

void setup(void)
{
  Serial.begin(57600);
  Serial.println("RF24Network/examples/helloworld_rx/");
  pinMode(3, OUTPUT);
  SPI.begin();
  radio.begin();
  network.begin(/*channel*/ 90, /*node address*/ this_node);
  analogWrite(3, 0);
}

void loop(void) {

  network.update();                  // Check the network regularly


  while ( network.available() ) {     // Is there anything ready for us?

    RF24NetworkHeader header;        // If so, grab it and print it out
    payload_t payload;
    network.read(header, &payload, sizeof(payload));
    Serial.print("Received packet id");
    Serial.print(payload.id);
    Serial.print(" value ");
    Serial.print(payload.value);
    Serial.print(" type ");
    Serial.println(payload.type);
    Serial.print(" my id ");
    Serial.println(id);
    if (payload.type == 5 && id == 0) {
      id = payload.id;
      sendAck(id);
    } else if (payload.id == id) {
      if (payload.type == 3) {
        if (payload.value == 1) {//turn on
          analogWrite(3, 0);
          state = 1;
        } else {
          analogWrite(3, 255);
          state = 0;
        }
        sendAck(payload.value);
      }
      if (payload.type == 0) {
        sendReply(state);
      }
    }
  }
}

void sendAck(unsigned long value)
{
  Serial.print("Sending ACK...");
  payload_t payload = { value, id, 4 };
  RF24NetworkHeader header(/*to node*/ other_node);
  bool ok = network.write(header, &payload, sizeof(payload));
  if (ok)
    Serial.println("ok.");
  else
    Serial.println("failed.");
}

void sendReply(unsigned long value)
{
  Serial.print("Sending Reply...");
  payload_t payload = { value, id, 1 };
  RF24NetworkHeader header(/*to node*/ other_node);
  bool ok = network.write(header, &payload, sizeof(payload));
  if (ok)
    Serial.println("ok.");
  else
    Serial.println("failed.");
}


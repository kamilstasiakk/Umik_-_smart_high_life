/*
  Copyright (C) 2012 James Coliz, Jr. <maniacbug@ymail.com>

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  version 2 as published by the Free Software Foundation.

  Update 2014 - TMRh20
*/

/**
   Simplest possible example of using RF24Network

   TRANSMITTER NODE
   Every 2 seconds, send a payload to the receiver node.
*/

#include <RF24Network.h>
#include <RF24.h>
#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

RF24 radio(6, 7);                   // nRF24L01(+) radio attached using Getting Started board

RF24Network network(radio);          // Network uses that radio

const uint16_t this_node = 01;        // Address of our node in Octal format
const uint16_t other_node = 00;       // Address of the other node in Octal format

const unsigned long interval = 2000; //ms  // How often to send 'hello world to the other unit

unsigned long last_sent;             // When did we last send?
unsigned long packets_sent;          // How many have we sent already


struct payload_t {                  // Structure of our payload
  unsigned long value;
  unsigned long id;
  unsigned long type;
};

/** ETHERNET COMMUNICATION */
EthernetUDP Udp;
byte mac[] = { 0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02 };
unsigned int localPort = 8888;

IPAddress remoteIp;
int remotePort;

void setup(void)
{
  Serial.begin(57600);
  Serial.println("RF24Network/examples/helloworld_tx/");

  SPI.begin();
  radio.begin();
  network.begin(/*channel*/ 90, /*node address*/ this_node);

  /** Start ethernet outputs on automate DHCP IP */
  Ethernet.begin(mac);
  Udp.begin(localPort);
}
boolean needToSendRF = false;
unsigned long globalValue;
unsigned long globalId;
unsigned long globalType;

void loop() {
  network.update();                          // Check the network regularly
  unsigned long now = millis();              // If it's time to send a message, send it!
  if ( needToSendRF )
  {
    boolean receivedAck = false;

    do {
      Serial.print("Sending...");
      payload_t payload = { globalValue, globalId , globalType};
      RF24NetworkHeader header(/*to node*/ other_node);
      bool ok = network.write(header, &payload, sizeof(payload));
      if (ok)
        Serial.println("ok.");
      else
        Serial.println("failed.");

      network.update();
      while ( network.available() ) {
        RF24NetworkHeader header;        // If so, grab it and print it out
        payload_t payload;
        network.read(header, &payload, sizeof(payload));
        Serial.print("Received packet #");
        Serial.print(payload.id);
        Serial.print(" at ");
        Serial.print(payload.value);
        Serial.print(" with type ");
        Serial.println(payload.type);
        if(payload.type == 4)
          receivedAck = true;
      }

      delay(50);
    } while (!receivedAck);
    needToSendRF = false;
  }


  /** WAIT FOR RASPBERRY TO PING */
  int packetSize = Udp.parsePacket();
  if (packetSize) {
    char packetBuffer[UDP_TX_PACKET_MAX_SIZE];
    remoteIp = Udp.remoteIP();
    remotePort = Udp.remotePort();
    /** Read the packet into packetBufffer */
    Udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
    for (int i = 0; i < packetSize; i++) {
      Serial.print(packetBuffer[i]);
    }
    Serial.println(" ");

    switch (packetBuffer[0]) {
      case 'X':
        initializeRemoteIp();
        break;
      case 'x':
        initializeRemoteIp();
        break;
      case 'A':
        addResource(packetBuffer, packetSize);
        break;
      case 'a':
        addResource(packetBuffer, packetSize);
        break;
      //      case 'N':
      //        turnOnLight();
      //        writeThroughUDP('D');
      //        break;
      //      case 'n':
      //        turnOnLight();
      //        writeThroughUDP('D');
      //        break;
      //      case 'F':
      //        turnOffLight();
      //        writeThroughUDP('D');
      //        break;
      //      case 'f':
      //        turnOffLight();
      //        writeThroughUDP('D');
      //        break;
      case 'G':
        getResource(packetBuffer, packetSize);
        break;
      case 'g':
        getResource(packetBuffer, packetSize);
        break;

    }

  }
}

void initializeRemoteIp() {
  //remoteIp = Udp.remoteIP();
  //remotePort = Udp.remotePort();
  Serial.print("RASPBERRY IP:");
  for (int i = 0; i < 4; i++) {
    Serial.print(remoteIp[i], DEC);
    if (i < 3) {
      Serial.print(".");
    }
  }
  Serial.println(" ");
  writeThroughUDP('D');
}

void addResource(char serverMsg[], int serverMsgSize) {
  Serial.println(" ");
  char id =  serverMsg[1];
  unsigned long idLong = id;
  Serial.print(id);
  writeThroughUDP('D');
  writeThroughRF24(48, idLong, 5);
}

void getResource(char serverMsg[], int serverMsgSize) {
  Serial.println(" ");
  char id =  serverMsg[1];
  Serial.print(id);
  unsigned long idLong = id;
  if (idLong < 100) {
    writeThroughRF24(48, idLong, 48);
  }
  //  else {
  //    if (lightIsTurnedOn)
  //      writeThroughUDP('N');
  //    else
  //      writeThroughUDP('F');
  //  }
}

void writeThroughUDP(unsigned char msg)
{
  Udp.beginPacket(remoteIp, remotePort);
  Udp.write(msg);
  Udp.endPacket();
}


void writeThroughRF24(unsigned long value, unsigned long id, unsigned long type)
{
  globalValue = value;
  globalId = id;
  globalType = type;
  needToSendRF = true;
}


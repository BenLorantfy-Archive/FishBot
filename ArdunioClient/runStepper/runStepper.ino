/*
 * Hello World!
 *
 * This is the Hello World! for Arduino. 
 * It shows how to send data to the computer
 */
int onPin = -1;
int pins[4] = { 4, 5, 6, 7};
int steps = 0;
String command = "";

void setup()                    // run once, when the sketch starts
{
  Serial.begin(57600);           // set up Serial library at 9600 bps
  
  Serial.println("ready-for-commands");  // prints hello with ending line break 

  // Initilize all the pins
  for(int i = 0; i < 4; i++){
    pinMode(pins[i], OUTPUT);
  }
}

void loop()                       // run over and over again
{
  if (Serial.available() > 0) {
    command = Serial.readStringUntil('\n');
    Serial.println("Recieved command: " + command);

    if(command == "rotate"){
      steps = 0;
    }
  }

  if(command == "rotate"){
    // Turn off the old pin (if there was an old pin)
    if(onPin >= 0){
      digitalWrite(onPin, LOW);
    }
     
    // Determine which pin should be on next
    onPin = getNextPinInSequence(onPin);
        
    // Turn on the next pin
    digitalWrite(onPin, HIGH);

    steps++;
    if(steps == 50){
      command = "stop";
    }else{
      // Wait some ms
      delay(200);
    }
  }

  if(command == "stop"){
    onPin = -1;
    
    // Turn off all pins
    for(int i = 0; i < 4; i++){
      digitalWrite(pins[i], LOW);
    }
    
    command = "";
  }
}

int getNextPinInSequence(int oldPin)
{
  // http://mechatronics.mech.northwestern.edu/design_ref/actuators/stepper_intro.html
  // Terminal 1a (0) +---+---+---+---
  // Terminal 1b (1) --+---+---+---+-
  // Terminal 2a (2) -+---+---+---+--
  // Terminal 2b (3) ---+---+---+---+ 
  // time ---> 
  if(oldPin == pins[0]) return pins[2];
  if(oldPin == pins[1]) return pins[3];
  if(oldPin == pins[2]) return pins[1];
  if(oldPin == pins[3]) return pins[0];
  
  return pins[0];
}


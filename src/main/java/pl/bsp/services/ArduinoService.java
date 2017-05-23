package pl.bsp.services;

public interface ArduinoService {
	public String findArduinoInNetwork();
	public void turnOnTheLight(String arduinoIp, int resourceId);
	public void turnOffTheLight(String arduinoIp, int resourceId);
}

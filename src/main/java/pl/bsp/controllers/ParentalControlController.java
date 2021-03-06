package pl.bsp.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import pl.bsp.arduino.ControllerBrigde;
import pl.bsp.model.ParentalControlPolicy;
import pl.bsp.model.User;
import pl.bsp.services.ParentalControlPolicyService;
import pl.bsp.services.ResourceServiceImpl;
import pl.bsp.services.UserServiceImpl;

/**
 * Created by Kamil on 2017-05-22.
 */
@RestController
public class ParentalControlController {

    @Autowired
    UserServiceImpl userService;
    @Autowired
    ResourceServiceImpl resServ;

    @Autowired
    ParentalControlPolicyService policyService;



    @RequestMapping(value="/parentalPolicies/{username}", method = RequestMethod.GET, produces =
            { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE } )
    public ResponseEntity<List<ParentalControlPolicy>> resources(@PathVariable("username") String username) {
        User resourcesOwner = userService.findByUsername(username);
        List<pl.bsp.model.ParentalControlPolicy> policies = resourcesOwner.getPolicies();
        if(policies == null || policies.isEmpty())
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        else
            return new ResponseEntity<>(policies, HttpStatus.OK);
    }

    @RequestMapping(value="/addParentalPolicies/", method = RequestMethod.GET, produces =
            { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE } )
    public ResponseEntity<ParentalControlPolicy> addResources() {
        ParentalControlPolicy policy = new ParentalControlPolicy();
        policy.setAction("turn on");
        policy.setDescription("dsadsa");
        policy.setEndTime("2017-05-23 17:00:00");
        policy.setStartTime("2017-05-23 17:00:00");
        policy.setResourceName("guziczek");
        policy.setUser(userService.findByUsername("a"));
        if(policyService.add(policy))
            return new ResponseEntity<>(policy, HttpStatus.OK);
        else
            return new ResponseEntity<>(policy, HttpStatus.BAD_REQUEST);
    }

    @RequestMapping(value="/parentalPolicy",method = RequestMethod.POST, produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE })
    public ResponseEntity<String> addResource(@RequestBody pl.bsp.entities.ParentalControlPolicy policy) {
        ParentalControlPolicy policyDb = new ParentalControlPolicy();
        User user = userService.findByUsername(policy.getUsername());
        policyDb.setResourceName(policy.getResourceName());
        policyDb.setUser(user);
        policyDb.setDescription(policy.getDescription());
        policyDb.setAction(policy.getAction());
        policyDb.setEndTime(policy.getEndTime());
        policyDb.setRepeatPatern(policy.getRepeatPatern());
        policyDb.setStartTime(policy.getStartTime());
        pl.bsp.model.Resource res =resServ.findByNameAndUser(policy.getResourceName(), user);
        ControllerBrigde.addPolicyToThread(policyDb,res,user);
        if(policyService.add(policyDb))
            return new ResponseEntity<>("{\"status\": \"success\"}", HttpStatus.OK);
        else
            return new ResponseEntity<>("{\"status\": \"error\"}", HttpStatus.BAD_REQUEST);
    }
    
    @RequestMapping(value = "/delete-policy/{username}/{serial_id}", method = RequestMethod.GET, produces = {
			MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE })
	public ResponseEntity<String> deletePolicy(@PathVariable("username") String userName,
			@PathVariable("serial_id") String policyId) {
		if (policyService.deletePolicy(Integer.parseInt(policyId), userName))
			return new ResponseEntity<>("{\"status\": \"deleted\"}",HttpStatus.OK);
		else
			return new ResponseEntity<>("{\"status\": \"error\"}",HttpStatus.NOT_FOUND);
	}
    
}

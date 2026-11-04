//SPDX-Lidense-Identifier: MIT

pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {ContentAnchor} from "../src/ContentAnchor.sol";

contract CounterAnchor is Script {
    
    function run() external returns (ContentAnchor _contentAnchor) {
        address operator = vm.envAddress("OPERATOR_ADDRESS");
        require(operator != address(0), "OPERATOR_ADDRESS not set");

        vm.startBroadcast();
        _contentAnchor = new ContentAnchor(operator);
        vm.stopBroadcast();

        console2.log("ContentAnchor deployed at:", address(_contentAnchor));
        console2.log("Operator set to:", operator);
    }
}

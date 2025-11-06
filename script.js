<a-entity 
        id="player" 
        position="0 0 0" 
        player-move="controllerListenerId: #controller-data;
                     navigationMeshClass: environmentGround;">
        
        <a-camera></a-camera>
    
        <a-entity 
            id="controller-data" 
            controller-listener="leftControllerId:  #left-controller; 
                                 rightControllerId: #right-controller;">
        </a-entity>

        <a-entity 
            id="left-controller"
            oculus-touch-controls="hand: left">
        </a-entity>

        <a-entity
            id="right-controller"
            oculus-touch-controls="hand: right"
            raycaster="objects: .raycaster-target, .environmentGround;"
            raycaster-extras="controllerListenerId: #controller-data; 
                              beamImageSrc: #gradient; beamLength: 0.5;">
        </a-entity>

    </a-entity>
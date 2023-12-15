import { task } from 'hardhat/config';
import { types } from 'hardhat/config';
import setLayerZeroBridge from './setLayerZeroBridge';
task('set_bridge').setAction(setLayerZeroBridge).addParam('onft', 'onft name').addParam('target', 'target network');

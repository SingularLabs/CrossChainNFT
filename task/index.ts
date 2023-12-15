import { task } from 'hardhat/config';
import { types } from 'hardhat/config';
import setLayerZeroBridge from './setLayerZeroBridge';
import testBridge from './testBridge';
task('set_bridge').setAction(setLayerZeroBridge).addParam('onft', 'onft name').addParam('target', 'target network');
task('test_bridge')
  .setAction(testBridge)
  .addParam('onft', 'onft name', 'MockOBoredApeYachtClub')
  .addParam('target', 'target network');

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContractCallRegularOptions, openContractCall } from '@stacks/connect';
import { Text } from '@stacks/ui';

import { CenteredErrorAlert } from '@components/centered-error-alert';
import { CenteredSpinner } from '@components/centered-spinner';
import {
  useGetPoxInfoQuery,
  useGetStatusQuery,
  useStackingClient,
} from '@components/stacking-client-provider/stacking-client-provider';

import { ChangeDirectStackingLayout } from './components/change-direct-stacking-layout';
import BigNumber from 'bignumber.js';

export function StackIncrease() {
  const navigate = useNavigate();
  const getStatusQuery = useGetStatusQuery();
  const getPoxInfoQuery = useGetPoxInfoQuery();

  const { client } = useStackingClient();
  const [isContractCallExtensionPageOpen, setIsContractCallExtensionPageOpen] = useState(false);
  if (getStatusQuery.isLoading || getPoxInfoQuery.isLoading) {
    return <CenteredSpinner />;
  }

  if (
    getStatusQuery.isError ||
    !getStatusQuery.data ||
    getPoxInfoQuery.isError ||
    !getPoxInfoQuery.data ||
    !client
  ) {
    const msg = 'Error while loading data, try reloading the page.';
    console.error(msg);
    return (
      <CenteredErrorAlert id="0abc083b-06c7-4795-8491-68264595f1b4">
        <Text>{msg}</Text>
      </CenteredErrorAlert>
    );
  }

  if (!getStatusQuery.data.stacked) {
    navigate('../direct-stacking-info');
    return <></>;
  }

  async function handleLockMore({ increaseBy }: { increaseBy: BigNumber }) {
    if (!client) return;
    const stackingContract = await client.getStackingContract();
    const stackIncreaseOptions = client.getStackIncreaseOptions({
      contract: stackingContract,
      increaseBy: increaseBy.toString(),
    });
    setIsContractCallExtensionPageOpen(true);
    openContractCall({
      // Type coercion necessary because the `network` property returned by
      // `client.getStackingContract()` has a wider type than allowed by `openContractCall`. Despite
      // the wider type, the actual value of `network` is always of the type `StacksNetwork`
      // expected by `openContractCall`.
      //
      // See
      // https://github.com/hirosystems/stacks.js/blob/0e1f9f19dfa45788236c9e481f9a476d9948d86d/packages/stacking/src/index.ts#L1054
      ...(stackIncreaseOptions as ContractCallRegularOptions),
      onCancel() {
        setIsContractCallExtensionPageOpen(false);
      },
      onFinish() {
        setIsContractCallExtensionPageOpen(false);
      },
    });
  }

  return (
    <ChangeDirectStackingLayout
      title="Lock more"
      details={getStatusQuery.data.details}
      rewardCycleId={getPoxInfoQuery.data.reward_cycle_id}
      handleLockMore={handleLockMore}
      isContractCallExtensionPageOpen={isContractCallExtensionPageOpen}
    />
  );
}

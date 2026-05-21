import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useMemo, useState } from 'react';
import { cloudFunctions, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PaymentTransaction, ProSubscription } from '../types';

export function useProAccess(user: User | null) {
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    return onSnapshot(
      doc(db, 'proSubscriptions', user.uid),
      (snapshot) => {
        setSubscription(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as ProSubscription) : null);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        try {
          handleFirestoreError(snapshotError, OperationType.GET, `proSubscriptions/${user.uid}`);
        } catch (wrappedError) {
          setError(wrappedError instanceof Error ? wrappedError.message : 'Unable to load Pro access.');
        }
        setLoading(false);
      }
    );
  }, [user]);

  const access = useMemo(() => {
    const isActive = subscription?.status === 'active';
    return {
      loading,
      subscription,
      tier: isActive ? subscription.tier : 'free',
      hasIndividualPro: isActive && subscription.tier === 'individual-diver-pro',
      hasDiveCentrePro: isActive && subscription.tier === 'dive-centre-pro',
      hasAnyPro: isActive && subscription.tier !== 'free',
      error,
    };
  }, [error, loading, subscription]);

  const createPaymentRequest = async (tier: PaymentTransaction['tier']) => {
    if (!user || !db || !cloudFunctions) {
      setError('Sign in before upgrading to Pro.');
      return;
    }

    const checkoutWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');
    setIsCreatingPayment(true);
    setError(null);
    setPaymentMessage(null);

    try {
      const createSwipePayment = httpsCallable<
        { tier: PaymentTransaction['tier'] },
        { transactionId: string; externalReference: string; paymentUrl?: string }
      >(cloudFunctions, 'createSwipeProPayment');
      const result = await createSwipePayment({ tier });
      const paymentUrl = result.data.paymentUrl;

      if (paymentUrl) {
        checkoutWindow?.location.assign(paymentUrl);
        if (!checkoutWindow) window.location.assign(paymentUrl);
        setPaymentMessage(`BML Swipe payment ${result.data.externalReference} created. Complete checkout to activate Pro after verification.`);
      } else {
        checkoutWindow?.close();
        setPaymentMessage(
          `BML Swipe payment ${result.data.externalReference} was created, but Swipe did not return a checkout link. Ask an administrator to verify transaction ${result.data.transactionId}.`
        );
      }
    } catch (paymentError) {
      checkoutWindow?.close();
      try {
        handleFirestoreError(paymentError, OperationType.CREATE, 'paymentTransactions');
      } catch (wrappedError) {
        setError(wrappedError instanceof Error ? wrappedError.message : 'Unable to create payment request.');
      }
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return {
    ...access,
    isCreatingPayment,
    paymentMessage,
    paymentUrlConfigured: true,
    createPaymentRequest,
  };
}
